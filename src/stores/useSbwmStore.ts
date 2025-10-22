import { defineStore } from "pinia";
import { apiGet, apiGetOne, apiUpsert } from "@/lib/sbwmApi";

// Minimal typings for common entities (extend as needed)
export type Project = {
  ID: number;
  ParentID: number;
  Number: string;
  Name: string;
  Description: string;
  TypeID: number;
  CustomerID: number;
  Coach: string;
  Status: number;
};

export type Task = {
  ID: number;
  ProjectID: number;
  StudentID: number;
  Name: string;
  Start: string; // ISO date
  Due: string;   // ISO date
  Done: number;  // 0/1
};

export type Student = {
  ID: number;
  Name: string;
  Firstname: string;
  Year: number;
  Fullname: string;
};

export type Timesheet = {
  ID: number;
  ProjectID: number;
  StudentID: number;
  Date: string;   // ISO date
  Minutes: number;
  Approved: number; // 0/1
};

// Read-only view rows
export type TaskView = {
  ID: number;
  ProjectID: number;
  ProjectName: string;
  StudentID: number;
  StudentName: string;
  TaskName: string;
  Start: string;
  Due: string;
  done: number;
};

export type EquipmentView = {
  ID: number;
  Name: string;
  Number: string;
  Description: string;
  Type: string;
};

// Describe resources: primary key + auto-increment flag + readOnly (for *View)
type ResourceMeta = {
  key: string;
  auto: boolean;
  readOnly?: boolean;
};

const RESOURCE_META: Record<string, ResourceMeta> = {
  Address: { key: "ID", auto: true },
  Country: { key: "ISO", auto: false },
  Customer: { key: "ID", auto: true },
  CustomerView: { key: "ID", auto: false, readOnly: true },
  Department: { key: "ID", auto: true },
  DepartmentMember: { key: "ID", auto: true },
  DepartmentMemberView: { key: "ID", auto: false, readOnly: true },
  Equipment: { key: "ID", auto: true },
  EquipmentReservation: { key: "ID", auto: true },
  EquipmentView: { key: "ID", auto: false, readOnly: true },
  Equipmenttype: { key: "ID", auto: true },
  Project: { key: "ID", auto: true },
  Projectrole: { key: "ID", auto: false },
  Projecttype: { key: "ID", auto: true },
  Student: { key: "ID", auto: true },
  Studentroleproject: { key: "ID", auto: true },
  Task: { key: "ID", auto: true },
  TaskView: { key: "ID", auto: false, readOnly: true },
  Teacher: { key: "Abbr", auto: false },
  Test: { key: "test_ID", auto: true },
  Timesheet: { key: "ID", auto: true },
};

type Dict<T> = Record<string | number, T>;

export const useSbwmStore = defineStore("sbwm", {
  state: () => ({
    // generic caches per resource
    collections: {} as Record<string, Dict<any>>,
    loading: {} as Record<string, boolean>,
    error: {} as Record<string, string | null>,
  }),
  getters: {
    list:
      (state) =>
      <T = any>(resource: string): T[] => {
        const col = state.collections[resource] || {};
        return Object.values(col) as T[];
      },
    byId:
      (state) =>
      <T = any>(resource: string, id: string | number): T | undefined => {
        const col = state.collections[resource] || {};
        return col[id] as T | undefined;
      },
  },
  actions: {
    _ensure(resource: string) {
      if (!this.collections[resource]) this.collections[resource] = {};
      if (!(resource in this.loading)) this.loading[resource] = false;
      if (!(resource in this.error)) this.error[resource] = null;
    },

    async fetchAll<T = any>(resource: string): Promise<T[]> {
      this._ensure(resource);
      this.loading[resource] = true;
      this.error[resource] = null;
      try {
        const rows = await apiGet<T>(resource);
        const meta = RESOURCE_META[resource];
        const key = meta?.key ?? "ID";
        const dict: Dict<T> = {};
        for (const row of rows as any[]) {
          dict[row[key]] = row as T;
        }
        this.collections[resource] = dict;
        return rows;
      } catch (e: any) {
        this.error[resource] = e?.message ?? String(e);
        throw e;
      } finally {
        this.loading[resource] = false;
      }
    },

    async fetchOne<T = any>(resource: string, id: string | number): Promise<T> {
      this._ensure(resource);
      this.loading[resource] = true;
      this.error[resource] = null;
      try {
        const row = await apiGetOne<T>(resource, id);
        const meta = RESOURCE_META[resource];
        const key = meta?.key ?? "ID";
        this.collections[resource] = {
          ...(this.collections[resource] || {}),
          [ (row as any)[key] ]: row,
        };
        return row;
      } catch (e: any) {
        this.error[resource] = e?.message ?? String(e);
        throw e;
      } finally {
        this.loading[resource] = false;
      }
    },

    /**
     * Save (create or update) where allowed.
     * For *View resources, throws because they are read-only per API docs.
     */
    async save<T extends Record<string, any>>(resource: string, payload: T): Promise<T> {
      const meta = RESOURCE_META[resource];
      if (!meta) throw new Error(`Unknown resource: ${resource}`);
      if (meta.readOnly) throw new Error(`${resource} is read-only (view)`);

      this._ensure(resource);
      this.loading[resource] = true;
      this.error[resource] = null;

      try {
        const saved = await apiUpsert<T>(resource, payload, meta.key, meta.auto);
        // merge into cache
        const keyVal = (saved as any)[meta.key];
        this.collections[resource] = {
          ...(this.collections[resource] || {}),
          [keyVal]: saved,
        };
        return saved;
      } catch (e: any) {
        this.error[resource] = e?.message ?? String(e);
        throw e;
      } finally {
        this.loading[resource] = false;
      }
    },
  },
});
