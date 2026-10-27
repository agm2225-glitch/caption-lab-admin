export type Field = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number";
  required?: boolean;
};

export type TableConfig = {
  slug: string;
  table: string;
  title: string;
  group: string;
  fields: Field[];
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  orderBy?: string;
  orderAsc?: boolean;
  upload?: { bucket: string; urlField: string };
};

const crud = { canCreate: true, canUpdate: true, canDelete: true };

const list: TableConfig[] = [
  {
    slug: "images", table: "images", title: "Images", group: "AI media", ...crud,
    upload: { bucket: "caption-images", urlField: "url" },
    fields: [
      { name: "url", label: "Image URL (or upload a file)", required: true },
      { name: "image_description", label: "Description", type: "textarea" },
    ],
  },
  {
    slug: "caption_examples", table: "caption_examples", title: "AI generation examples", group: "AI media", ...crud,
    fields: [
      { name: "image_description", label: "Image description", type: "textarea" },
      { name: "caption", label: "Example caption", type: "textarea", required: true },
    ],
  },

  { slug: "humor_flavors", table: "humor_flavors", title: "Prompt chains", group: "Prompt chains", fields: [] },
  {
    slug: "humor_flavor_steps", table: "humor_flavor_steps", title: "Prompt chain steps", group: "Prompt chains",
    orderBy: "humor_flavor_id", orderAsc: true, fields: [],
  },
  {
    slug: "humor_flavor_mix", table: "humor_flavor_mix", title: "Prompt chain mix", group: "Prompt chains",
    canUpdate: true, orderBy: "id", orderAsc: true,
    fields: [{ name: "caption_count", label: "Caption count", type: "number", required: true }],
  },

  { slug: "caption_requests", table: "caption_requests", title: "Generation requests", group: "Generation logs", fields: [] },
  { slug: "llm_model_responses", table: "llm_model_responses", title: "LLM responses", group: "Generation logs", fields: [] },

  {
    slug: "llm_providers", table: "llm_providers", title: "LLM providers", group: "LLM", ...crud,
    fields: [{ name: "name", label: "Name", required: true }],
  },
  {
    slug: "llm_models", table: "llm_models", title: "LLM models", group: "LLM", ...crud,
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "llm_provider_id", label: "Provider ID", type: "number", required: true },
      { name: "provider_model_id", label: "Provider model ID" },
    ],
  },

  {
    slug: "allowed_signup_domains", table: "allowed_signup_domains", title: "Allowed signup domains", group: "Access", ...crud,
    fields: [{ name: "apex_domain", label: "Domain (e.g. columbia.edu)", required: true }],
  },
  {
    slug: "whitelist_email_addresses", table: "whitelist_email_addresses", title: "Whitelisted emails", group: "Access", ...crud,
    fields: [{ name: "email_address", label: "Email address", required: true }],
  },

  {
    slug: "terms", table: "terms", title: "Terms", group: "Content", ...crud,
    fields: [
      { name: "term", label: "Term", required: true },
      { name: "definition", label: "Definition", type: "textarea" },
    ],
  },
];

export const TABLES: Record<string, TableConfig> = Object.fromEntries(
  list.map((t) => [t.slug, t])
);