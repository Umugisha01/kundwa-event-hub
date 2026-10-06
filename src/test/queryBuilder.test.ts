import { describe, it, expect, vi } from "vitest";
import { supabase } from "@/integrations/supabase/client";

describe("DjangoQueryBuilder chaining", () => {
  it("should chain update().eq() without throwing", () => {
    const builder = supabase.from("trusted_brands").update({ name: "Test Brand" });
    expect(typeof builder.eq).toBe("function");
    const chained = builder.eq("id", "123");
    expect(chained).toBe(builder);
    expect(builder.filters.id).toBe("123");
    expect(builder.operation).toBe("update");
    expect(builder.payload).toEqual({ name: "Test Brand" });
  });

  it("should chain delete().eq() without throwing", () => {
    const builder = supabase.from("trusted_brands").delete();
    expect(typeof builder.eq).toBe("function");
    const chained = builder.eq("id", "456");
    expect(chained).toBe(builder);
    expect(builder.filters.id).toBe("456");
    expect(builder.operation).toBe("delete");
  });

  it("should chain insert() properly", () => {
    const builder = supabase.from("trusted_brands").insert({ name: "New Brand" });
    expect(typeof builder.then).toBe("function");
    expect(builder.operation).toBe("insert");
    expect(builder.payload).toEqual({ name: "New Brand" });
  });
});
