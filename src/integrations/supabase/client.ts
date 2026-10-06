/**
 * Supabase to Django Compatibility Client Adapter
 * 
 * Intercepts existing Supabase query builder syntax and auth calls, 
 * routing them to the Django REST backend.
 */

import { apiUrl, resolveMediaUrl, API_BASE } from "@/config/api";
export { apiUrl, resolveMediaUrl, API_BASE };

export interface User {
  id: string;
  email: string;
  full_name?: string;
  [key: string]: any;
}

export interface Session {
  user: User;
  [key: string]: any;
}

class MockChannel {
  channelName: string;
  callbacks: Function[] = [];
  intervalId: any = null;

  constructor(name: string) {
    this.channelName = name;
  }

  on(event: string, filter: any, callback: Function) {
    this.callbacks.push(callback);
    return this;
  }

  subscribe(statusCallback?: Function) {
    if (statusCallback) statusCallback("SUBSCRIBED");
    
    // Fallback polling: check for new messages/updates every 2 seconds
    this.intervalId = setInterval(() => {
      this.callbacks.forEach(cb => cb({}));
    }, 2000);
    
    return {
      unsubscribe: () => {
        if (this.intervalId) {
          clearInterval(this.intervalId);
        }
      }
    };
  }
}

class DjangoQueryBuilder implements PromiseLike<{ data: any; error: any }> {
  table: string;
  filters: { [key: string]: any } = {};
  ordering: string | null = null;
  isSingle = false;
  limitNum: number | null = null;
  operation: "select" | "insert" | "update" | "delete" = "select";
  payload: any = null;

  constructor(table: string) {
    this.table = table;
  }

  select(columns?: string) {
    if (!this.operation || this.operation === "select") {
      this.operation = "select";
    }
    return this;
  }

  eq(column: string, value: any) {
    // Map uid owner query to match Django's view permissions
    if (column === "user_id" || column === "sender_id") {
      // Ignored on query parameters as Django handles session filters automatically
      return this;
    }
    this.filters[column] = value;
    return this;
  }

  neq(column: string, value: any) {
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    const desc = options?.ascending === false;
    this.ordering = desc ? `-${column}` : column;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  limit(num: number) {
    this.limitNum = num;
    return this;
  }

  insert(data: any) {
    this.operation = "insert";
    this.payload = data;
    return this;
  }

  update(data: any) {
    this.operation = "update";
    this.payload = data;
    return this;
  }

  delete() {
    this.operation = "delete";
    return this;
  }

  private getHeaders(): Record<string, string> {
    const token = localStorage.getItem("django_access_token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  private async tryRefreshToken(): Promise<string | null> {
    const refresh = localStorage.getItem("django_refresh_token");
    if (!refresh) return null;
    try {
      const res = await fetch(apiUrl("/api/auth/token/refresh/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.access) {
          localStorage.setItem("django_access_token", json.access);
          return json.access;
        }
      }
    } catch {
      // ignore
    }
    return null;
  }

  private async fetchWithAuth(url: string, init: RequestInit = {}): Promise<Response> {
    const headers = this.getHeaders();
    init.headers = { ...headers, ...(init.headers || {}) };

    let response = await fetch(url, init);
    if (response.status === 401 && localStorage.getItem("django_refresh_token")) {
      const newToken = await this.tryRefreshToken();
      if (newToken) {
        const retryHeaders = {
          ...(init.headers as Record<string, string>),
          "Authorization": `Bearer ${newToken}`,
        };
        response = await fetch(url, { ...init, headers: retryHeaders });
      }
    }
    return response;
  }

  async execute(): Promise<{ data: any; error: any }> {
    try {
      if (this.operation === "insert") {
        return await this.executeInsert();
      }
      if (this.operation === "update") {
        return await this.executeUpdate();
      }
      if (this.operation === "delete") {
        return await this.executeDelete();
      }
      return await this.executeSelect();
    } catch (err: any) {
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }

  private async executeSelect(): Promise<{ data: any; error: any }> {
    let endpoint = this.table;
    if (endpoint === "service_inquiries") {
      endpoint = "contact_submissions";
    }

    const basePath = `/api/${endpoint}/${this.isSingle && this.filters.id ? `${this.filters.id}/` : ""}`;
    let url = apiUrl(basePath);
    if (!this.isSingle || !this.filters.id) {
      const params = new URLSearchParams();
      Object.entries(this.filters).forEach(([k, v]) => {
        if (k !== "id") params.append(k, String(v));
      });
      if (this.ordering) params.append("ordering", this.ordering);
      if (this.limitNum) params.append("limit", String(this.limitNum));

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
    }

    const response = await this.fetchWithAuth(url, { method: "GET" });

    if (!response.ok) {
      const errText = await response.text();
      return { data: null, error: new Error(errText || `HTTP ${response.status}`) };
    }

    const json = await response.json();

    if (this.isSingle) {
      if (Array.isArray(json)) {
        return { data: json[0] || null, error: null };
      }
      return { data: json, error: null };
    }
    return { data: json, error: null };
  }

  private async executeInsert(): Promise<{ data: any; error: any }> {
    let endpoint = this.table;
    let bodyData = this.payload;

    if (endpoint === "service_inquiries") {
      endpoint = "contact_submissions";
      const item = Array.isArray(bodyData) ? bodyData[0] : bodyData;
      bodyData = {
        full_name: item?.customer_name || item?.name || item?.full_name || "Inquiry",
        email: item?.customer_email || item?.email || "",
        phone: item?.customer_phone || item?.phone || "",
        message: `${item?.service_name ? `[${item.service_name}] ` : ""}${item?.message || ""}`,
        status: item?.status || "Pending",
      };
    } else if (Array.isArray(bodyData) && bodyData.length === 1) {
      bodyData = bodyData[0];
    }

    const response = await this.fetchWithAuth(apiUrl(`/api/${endpoint}/`), {
      method: "POST",
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { data: null, error: new Error(errText || `Insert failed with HTTP ${response.status}`) };
    }

    const json = await response.json();
    return { data: json, error: null };
  }

  private async executeUpdate(): Promise<{ data: any; error: any }> {
    const endpoint = this.table;
    let id = this.filters.id;

    // Fallback for singleton settings if id filter wasn't explicitly provided
    if (!id && (endpoint === "hero_settings" || endpoint === "footer_settings" || endpoint === "site_statistics")) {
      try {
        const getRes = await this.fetchWithAuth(apiUrl(`/api/${endpoint}/`), { method: "GET" });
        if (getRes.ok) {
          const list = await getRes.json();
          if (Array.isArray(list) && list.length > 0) {
            id = list[0].id;
          }
        }
      } catch {
        // fallback
      }
    }

    let url = apiUrl(`/api/${endpoint}/${id ? `${id}/` : ""}`);

    let bodyData = this.payload;
    if (Array.isArray(bodyData) && bodyData.length === 1) {
      bodyData = bodyData[0];
    }

    const response = await this.fetchWithAuth(url, {
      method: "PATCH",
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { data: null, error: new Error(errText || `Update failed with HTTP ${response.status}`) };
    }

    const json = await response.json();
    return { data: json, error: null };
  }

  private async executeDelete(): Promise<{ data: any; error: any }> {
    const endpoint = this.table;
    const id = this.filters.id;

    if (!id) {
      return { data: null, error: new Error("Delete requires an id filter") };
    }

    const url = apiUrl(`/api/${endpoint}/${id}/`);
    const response = await this.fetchWithAuth(url, {
      method: "DELETE",
    });

    if (!response.ok && response.status !== 204) {
      const errText = await response.text();
      return { data: null, error: new Error(errText || `Delete failed with HTTP ${response.status}`) };
    }

    return { data: true, error: null };
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
  ): Promise<{ data: any; error: any } | TResult> {
    return this.execute().catch(onrejected);
  }
}

let authListener: Function | null = null;

const auth = {
  async signUp({ email, password, options }: any) {
    try {
      const response = await fetch(apiUrl("/api/auth/register/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          full_name: options?.data?.full_name || "",
        }),
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }
      
      const json = await response.json();
      return { data: json, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async signInWithPassword({ email, password }: any) {
    try {
      const response = await fetch(apiUrl("/api/auth/login/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }
      
      const json = await response.json();
      localStorage.setItem("django_access_token", json.access);
      localStorage.setItem("django_refresh_token", json.refresh);
      localStorage.setItem("django_user", JSON.stringify(json.user));
      
      if (authListener) {
        authListener("SIGNED_IN", { user: json.user, session: { user: json.user } });
      }
      
      return { data: { user: json.user, session: { user: json.user } }, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async signOut() {
    localStorage.removeItem("django_access_token");
    localStorage.removeItem("django_refresh_token");
    localStorage.removeItem("django_user");
    
    if (authListener) {
      authListener("SIGNED_OUT", null);
    }
    return { error: null };
  },

  async getSession() {
    const token = localStorage.getItem("django_access_token");
    const userStr = localStorage.getItem("django_user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        return { data: { session: { user } }, error: null };
      } catch {
        return { data: { session: null }, error: null };
      }
    }
    return { data: { session: null }, error: null };
  },

  onAuthStateChange(callback: Function) {
    authListener = callback;
    const token = localStorage.getItem("django_access_token");
    const userStr = localStorage.getItem("django_user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        callback("INITIAL_SESSION", { user, session: { user } });
      } catch {
        callback("SIGNED_OUT", null);
      }
    } else {
      callback("SIGNED_OUT", null);
    }
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            authListener = null;
          }
        }
      }
    };
  }
};

export const supabase = {
  auth,
  from(table: string) {
    return new DjangoQueryBuilder(table);
  },
  channel(name: string) {
    return new MockChannel(name);
  }
};