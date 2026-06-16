/**
 * Supabase to Django Compatibility Client Adapter
 * 
 * Intercepts existing Supabase query builder syntax and auth calls, 
 * routing them to the Django REST backend.
 */

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

class DjangoQueryBuilder {
  table: string;
  filters: { [key: string]: any } = {};
  ordering: string | null = null;
  isSingle = false;
  limitNum: number | null = null;

  constructor(table: string) {
    this.table = table;
  }

  select(columns?: string) {
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

  // Supporting promise resolutions
  async then(resolve: Function) {
    try {
      const result = await this.execute();
      resolve({ data: result, error: null });
    } catch (err: any) {
      resolve({ data: null, error: err });
    }
  }

  async execute() {
    const token = localStorage.getItem("django_access_token");
    const headers: any = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let url = `/api/${this.table}/`;
    
    if (this.isSingle && this.filters.id) {
      url += `${this.filters.id}/`;
    } else {
      const params = new URLSearchParams();
      Object.entries(this.filters).forEach(([k, v]) => {
        if (k !== "id") params.append(k, String(v));
      });
      if (this.ordering) params.append("ordering", this.ordering);
      if (this.limitNum) params.append("limit", String(this.limitNum));
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || `HTTP ${response.status}`);
    }
    
    const json = await response.json();
    
    // Automatically unpack single object if client expected one
    if (this.isSingle) {
      if (Array.isArray(json)) {
        return json[0] || null;
      }
      return json;
    }
    return json;
  }

  async insert(data: any) {
    const token = localStorage.getItem("django_access_token");
    const headers: any = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`/api/${this.table}/`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errText = await response.text();
        return { data: null, error: new Error(errText) };
      }

      const json = await response.json();
      return { data: json, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  async update(data: any) {
    const token = localStorage.getItem("django_access_token");
    const headers: any = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const id = this.filters.id;
    if (!id) {
      return { data: null, error: new Error("Update requires an id filter") };
    }

    try {
      const response = await fetch(`/api/${this.table}/${id}/`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errText = await response.text();
        return { data: null, error: new Error(errText) };
      }

      const json = await response.json();
      return { data: json, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  async delete() {
    const token = localStorage.getItem("django_access_token");
    const headers: any = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const id = this.filters.id;
    if (!id) {
      return { data: null, error: new Error("Delete requires an id filter") };
    }

    try {
      const response = await fetch(`/api/${this.table}/${id}/`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        const errText = await response.text();
        return { data: null, error: new Error(errText) };
      }

      return { data: true, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }
}

let authListener: Function | null = null;

const auth = {
  async signUp({ email, password, options }: any) {
    try {
      const response = await fetch("/api/auth/register/", {
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
      const response = await fetch("/api/auth/login/", {
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