import { describe, it, expect, vi } from "vitest";

describe("Basic Functionality Tests", () => {
  describe("Environment Setup", () => {
    it("should have proper test environment", () => {
      expect(typeof vi).toBe("object");
      expect(typeof global).toBe("object");
    });

    it("should have mocked File constructor", () => {
      const file = new File(["test"], "test.txt", { type: "text/plain" });
      expect(file.name).toBe("test.txt");
      expect(file.type).toBe("text/plain");
      expect(file.arrayBuffer).toBeDefined();
    });

    it("should have mocked crypto.subtle", () => {
      expect(global.crypto.subtle.digest).toBeDefined();
    });

    it("should have mocked canvas methods", () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      expect(ctx).toBeDefined();
      expect(ctx?.drawImage).toBeDefined();
    });

    it("should have mocked URL methods", () => {
      expect(global.URL.createObjectURL).toBeDefined();
      expect(global.URL.revokeObjectURL).toBeDefined();
    });
  });

  describe("File Processing", () => {
    it("should create File with arrayBuffer method", async () => {
      const file = new File(["test content"], "test.txt");
      const buffer = await file.arrayBuffer();
      expect(buffer).toBeInstanceOf(ArrayBuffer);
    });

    it("should handle file size and type", () => {
      const file = new File(["test"], "test.txt", { type: "text/plain" });
      expect(file.size).toBeGreaterThan(0);
      expect(file.type).toBe("text/plain");
    });
  });

  describe("DOM Events", () => {
    it("should create DragEvent", () => {
      const event = new DragEvent("dragstart");
      expect(event.type).toBe("dragstart");
      expect(event.dataTransfer).toBeDefined();
    });

    it("should create CustomEvent", () => {
      const event = new CustomEvent("test", { detail: { foo: "bar" } });
      expect(event.type).toBe("test");
      expect(event.detail).toEqual({ foo: "bar" });
    });
  });

  describe("Performance APIs", () => {
    it("should have performance.now", () => {
      const time = performance.now();
      expect(typeof time).toBe("number");
      expect(time).toBeGreaterThan(0);
    });

    it("should have performance marking methods", () => {
      expect(performance.mark).toBeDefined();
      expect(performance.measure).toBeDefined();
    });
  });
});
