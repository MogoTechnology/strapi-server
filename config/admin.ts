import type { Core } from "@strapi/strapi";

// Function to generate preview pathname based on content type and document
const getPreviewPathname = (
  _uid: string,
  { document }: { document: any },
): string | null => {
  const { slug } = document;

  switch (_uid) {
    // Handle blog articles
    case "api::article.article": {
      if (!slug) {
        return "/blog";
      }
      return `/blog/${slug}`;
    }
    default: {
      return null;
    }
  }
};

const config = ({
  env,
}: Core.Config.Shared.ConfigParams): Core.Config.Admin => {
  const clientUrl = env("CLIENT_URL", "http://localhost:3000");
  const previewSecret = env("PREVIEW_SECRET", "");

  return {
    auth: {
      secret: env("ADMIN_JWT_SECRET"),
    },
    apiToken: {
      salt: env("API_TOKEN_SALT"),
    },
    transfer: {
      token: {
        salt: env("TRANSFER_TOKEN_SALT"),
      },
    },
    secrets: {
      encryptionKey: env("ENCRYPTION_KEY"),
    },
    flags: {
      nps: env.bool("FLAG_NPS", true),
      promoteEE: env.bool("FLAG_PROMOTE_EE", true),
    },
    preview: {
      enabled: true,
      config: {
        allowedOrigins: [clientUrl],
        async handler(uid, { documentId, status }) {
          // Fetch the complete document from Strapi
          const document = await strapi
            .documents(uid as any)
            .findOne({ documentId });

          // Generate the preview pathname based on content type and document
          const pathname = getPreviewPathname(uid, { document });

          // Disable preview if the pathname is not found
          if (!pathname) {
            return null;
          }

          // Build the preview URL
          const urlSearchParams = new URLSearchParams({
            url: pathname,
            secret: previewSecret,
            status,
          });

          return `${clientUrl}/api/preview?${urlSearchParams}`;
        },
      },
    },
  };
};

export default config;
