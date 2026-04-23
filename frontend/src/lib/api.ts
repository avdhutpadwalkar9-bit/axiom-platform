const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      // Try refresh
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        headers["Authorization"] = `Bearer ${this.getToken()}`;
        const retry = await fetch(`${API_BASE}${path}`, {
          ...options,
          headers,
        });
        if (!retry.ok) throw new Error(await retry.text());
        if (retry.status === 204) return undefined as T;
        return retry.json();
      }
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  private async tryRefresh(): Promise<boolean> {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      return true;
    } catch {
      return false;
    }
  }

  // Auth
  async signup(email: string, password: string, name?: string) {
    return this.request<{ id: string; email: string }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    const data = await this.request<{
      access_token: string;
      refresh_token: string;
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    return data;
  }

  async getMe() {
    return this.request<{
      id: string;
      email: string;
      name: string | null;
      is_email_verified: boolean;
      // Set by the backend based on the AI_ASSISTANT_ALLOWED_EMAILS
      // allowlist. Default `true` when the field is missing, which
      // keeps older backends (pre-gate) working unchanged.
      has_ai_access?: boolean;
    }>("/api/auth/me");
  }

  async verifyEmail(code: string) {
    return this.request<{ message: string }>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  }

  async resendVerification() {
    return this.request<{ message: string }>("/api/auth/resend-verification", {
      method: "POST",
    });
  }

  // Irreversible. Wipes the user row and every record tied to it.
  // Caller is responsible for clearing localStorage + redirecting on success.
  async deleteAccount(password: string, confirmation: string) {
    return this.request<{ message: string }>("/api/auth/delete-account", {
      method: "POST",
      body: JSON.stringify({ password, confirmation }),
    });
  }

  // Chat — sends a question to the backend CortexAI advisor.
  //
  // Pipeline (server-side):
  //   1. mode="quick" → Quick-Match (FAQ retriever) tries first. Good
  //      match → canned answer interpolated with user's own numbers,
  //      no model call needed.
  //   2. Anything else → Reasoner (Quick) or Strategist with extended
  //      reasoning (Deep). See /how-it-works for the full architecture.
  //
  // Response carries a `source` so the UI can badge "FAQ" vs "AI" for
  // trust + tuning visibility.
  async chat(payload: {
    question: string;
    analysis_result?: Record<string, unknown>;
    conversation_history?: Array<{ role: "user" | "ai"; text: string }>;
    business_context?: Record<string, unknown>;
    page_context?: string;
    mode?: "quick" | "deep";
    region?: "US" | "IN";
  }) {
    // Backend's build_financial_context() reads specific keys from
    // analysis_result (financial_statements, ratios, classified_accounts,
    // etc.) — arbitrary new keys get dropped. To make page_context visible
    // to the model we prepend it onto the question itself, bracketed so
    // the LLM can tell it apart from the user's actual words.
    const composedQuestion = payload.page_context
      ? `[Context about the page the user is viewing]\n${payload.page_context}\n\n[User's question]\n${payload.question}`
      : payload.question;
    return this.request<{
      response: string;
      source: "faq" | "ai";
      faq_id: string | null;
      mode: "quick" | "deep";
    }>("/api/chat/ask", {
      method: "POST",
      body: JSON.stringify({
        question: composedQuestion,
        analysis_result: payload.analysis_result ?? {},
        conversation_history: payload.conversation_history ?? [],
        business_context: payload.business_context ?? null,
        mode: payload.mode ?? "quick",
        region: payload.region ?? "US",
      }),
    });
  }

  // Thumbs up/down on a single AI response. Phase 3.5 — persists to
  // the chat_feedback table so the admin feedback dashboard can chart
  // real patterns (which FAQs fail, which modes underperform, etc.).
  async sendChatFeedback(payload: {
    question: string;
    response: string;
    helpful: boolean;
    notes?: string;
    source?: "faq" | "ai";
    faq_id?: string | null;
    mode?: "quick" | "deep";
    page?: string;
  }) {
    return this.request<{ ok: boolean }>("/api/chat/feedback", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // Streaming Deep-mode chat. Uses Server-Sent Events over fetch so the
  // frontend can render thinking tokens live (like o1's "thinking…" UX).
  //
  // Usage:
  //   const abortCtrl = new AbortController();
  //   await api.chatStream(payload, {
  //     onThinking: (chunk) => { thinkingBuffer += chunk; },
  //     onResponse: (chunk) => { responseBuffer += chunk; },
  //     onDone: () => { setLoading(false); },
  //     onError: (msg) => { setError(msg); },
  //     signal: abortCtrl.signal,
  //   });
  //
  // SSE parsing is done manually here (rather than EventSource) because
  // EventSource doesn't support POST bodies or Authorization headers —
  // two things we need.
  async chatStream(
    payload: {
      question: string;
      analysis_result?: Record<string, unknown>;
      conversation_history?: Array<{ role: "user" | "ai"; text: string }>;
      business_context?: Record<string, unknown>;
      page_context?: string;
      region?: "US" | "IN";
    },
    handlers: {
      onThinking?: (chunk: string) => void;
      onResponse?: (chunk: string) => void;
      onDone?: () => void;
      // Second arg is the HTTP status when the error originated from a
      // non-2xx response. Callers use this to distinguish a 404 (endpoint
      // not deployed yet — fall back to /ask) from a generic stream crash.
      onError?: (msg: string, status?: number) => void;
      signal?: AbortSignal;
    },
  ): Promise<void> {
    const composedQuestion = payload.page_context
      ? `[Context about the page the user is viewing]\n${payload.page_context}\n\n[User's question]\n${payload.question}`
      : payload.question;

    const token = this.getToken();
    const res = await fetch(`${API_BASE}/api/chat/ask-stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        question: composedQuestion,
        analysis_result: payload.analysis_result ?? {},
        conversation_history: payload.conversation_history ?? [],
        business_context: payload.business_context ?? null,
        mode: "deep",
        region: payload.region ?? "US",
      }),
      signal: handlers.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      handlers.onError?.(text || `HTTP ${res.status}`, res.status);
      return;
    }
    if (!res.body) {
      handlers.onError?.("No response body for streaming.");
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    // Buffer accumulates raw bytes decoded to text. SSE messages are
    // terminated by a blank line (\n\n). Anything before the last
    // \n\n is complete and parseable; anything after is a partial
    // event we keep for the next chunk.
    let buf = "";

    const parseEventBlock = (block: string) => {
      // A block looks like:
      //   event: thinking
      //   data: {"text": "hello"}
      // Pull out the event name + the JSON on the data line.
      let evt = "message";
      let dataLine = "";
      for (const line of block.split("\n")) {
        if (line.startsWith("event:")) evt = line.slice(6).trim();
        else if (line.startsWith("data:")) dataLine += line.slice(5).trim();
      }
      if (!dataLine) return;
      let data: { text?: string } = {};
      try {
        data = JSON.parse(dataLine);
      } catch {
        // Ignore malformed JSON; continue reading the rest of the stream.
        return;
      }
      if (evt === "thinking") handlers.onThinking?.(data.text ?? "");
      else if (evt === "response") handlers.onResponse?.(data.text ?? "");
      else if (evt === "done") handlers.onDone?.();
      else if (evt === "error") handlers.onError?.(data.text ?? "Unknown error");
    };

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        // Split on blank lines. Keep the tail (possibly-partial event) in buf.
        const parts = buf.split("\n\n");
        buf = parts.pop() ?? "";
        for (const part of parts) {
          if (part.trim()) parseEventBlock(part);
        }
      }
      // Flush any remaining buffered event after the stream closes.
      if (buf.trim()) parseEventBlock(buf);
    } catch (e) {
      // AbortError shouldn't surface — user deliberately cancelled.
      if ((e as { name?: string })?.name === "AbortError") return;
      handlers.onError?.(e instanceof Error ? e.message : "Stream read failed");
    } finally {
      try {
        reader.releaseLock();
      } catch {
        /* already released */
      }
    }
  }

  // Aggregate feedback stats. `scope="mine"` (default) returns just the
  // current user's votes; `scope="all"` returns platform-wide. Backend
  // will gate scope=all on admin role once we have multi-tenant.
  async getFeedbackStats(scope: "mine" | "all" = "mine") {
    return this.request<{
      total: number;
      helpful_count: number;
      unhelpful_count: number;
      helpful_rate_pct: number;
      by_mode: Record<
        string,
        { total: number; helpful: number; unhelpful: number; helpful_rate_pct: number }
      >;
      by_source: Record<
        string,
        { total: number; helpful: number; unhelpful: number; helpful_rate_pct: number }
      >;
      top_downvoted_faqs: Array<{ faq_id: string; downvote_count: number }>;
      recent_downvotes: Array<{
        created_at: string;
        question: string;
        response_snippet: string;
        source: string | null;
        mode: string | null;
        page: string | null;
        faq_id: string | null;
      }>;
    }>(`/api/chat/feedback/stats?scope=${scope}`);
  }

  // Models
  async listModels() {
    return this.request<
      Array<{
        id: string;
        name: string;
        description: string | null;
        start_date: string;
        period_count: number;
        updated_at: string;
      }>
    >("/api/models");
  }

  async createModel(data: {
    name: string;
    description?: string;
    start_date: string;
    period_count?: number;
  }) {
    return this.request<{ id: string }>("/api/models", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getModel(id: string) {
    return this.request<{
      id: string;
      name: string;
      description: string | null;
      start_date: string;
      period_count: number;
    }>(`/api/models/${id}`);
  }

  async deleteModel(id: string) {
    return this.request<void>(`/api/models/${id}`, { method: "DELETE" });
  }

  // Sections
  async listSections(modelId: string) {
    return this.request<
      Array<{
        id: string;
        name: string;
        section_type: string | null;
        sort_order: number;
        statement: string | null;
      }>
    >(`/api/models/${modelId}/sections`);
  }

  async createSection(
    modelId: string,
    data: { name: string; section_type?: string; statement?: string; sort_order?: number }
  ) {
    return this.request<{ id: string }>(`/api/models/${modelId}/sections`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Variables
  async listVariables(modelId: string) {
    return this.request<
      Array<{
        id: string;
        name: string;
        slug: string;
        section_id: string | null;
        variable_type: string;
        data_type: string;
        formula: string | null;
        default_value: number | null;
        sort_order: number;
      }>
    >(`/api/models/${modelId}/variables`);
  }

  async createVariable(
    modelId: string,
    data: {
      name: string;
      section_id?: string;
      variable_type?: string;
      data_type?: string;
      formula?: string;
      default_value?: number;
      sort_order?: number;
    }
  ) {
    return this.request<{ id: string }>(`/api/models/${modelId}/variables`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateVariable(
    variableId: string,
    data: { name?: string; formula?: string; sort_order?: number }
  ) {
    return this.request(`/api/variables/${variableId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteVariable(variableId: string) {
    return this.request<void>(`/api/variables/${variableId}`, {
      method: "DELETE",
    });
  }

  // Scenarios
  async listScenarios(modelId: string) {
    return this.request<
      Array<{
        id: string;
        name: string;
        is_base: boolean;
        color: string | null;
      }>
    >(`/api/models/${modelId}/scenarios`);
  }

  // Cells
  async updateCell(data: {
    variable_id: string;
    scenario_id: string;
    period_index: number;
    value: number | null;
  }) {
    return this.request("/api/cells", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async bulkUpdateCells(
    updates: Array<{
      variable_id: string;
      scenario_id: string;
      period_index: number;
      value: number | null;
    }>
  ) {
    return this.request("/api/cells/bulk", {
      method: "PUT",
      body: JSON.stringify({ updates }),
    });
  }

  // Compute
  async compute(modelId: string, scenarioId?: string) {
    const query = scenarioId ? `?scenario_id=${scenarioId}` : "";
    return this.request<{
      scenario_id: string;
      period_count: number;
      start_date: string;
      values: Record<string, Record<number, number>>;
    }>(`/api/models/${modelId}/compute${query}`);
  }
}

export const api = new ApiClient();
