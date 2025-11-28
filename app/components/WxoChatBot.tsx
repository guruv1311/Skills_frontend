// WxoLoader.tsx
"use client";

import { useEffect } from "react";

export default function WxoLoader({
  host = process.env.NEXT_PUBLIC_WXO_HOST,
  orchestrationID = process.env.NEXT_PUBLIC_WXO_ORCHESTRATION_ID,
  crn = process.env.NEXT_PUBLIC_WXO_CRN,
  agentId = process.env.NEXT_PUBLIC_WXO_AGENT_ID,
  agentEnvId = process.env.NEXT_PUBLIC_WXO_AGENT_ENV_ID,
}: {
  host?: string;
  orchestrationID?: string;
  crn?: string;
  agentId?: string;
  agentEnvId?: string;
}) {
  useEffect(() => {
    if (!host) {
      console.warn("WxoLoader: missing host URL");
      return;
    }
    if (
      (window as any).wxOConfiguration ||
      document.querySelector(`script[src*="wxoLoader.js"]`)
    ) {
      return;
    }

    (window as any).wxOConfiguration = {
      orchestrationID,
      hostURL: host,
      rootElementID: "root",
      deploymentPlatform: "ibmcloud",
      crn,
      chatOptions: {
        agentId,
        agentEnvironmentId: agentEnvId,
      },
    };

    const script = document.createElement("script");
    script.src = `${host}/wxochat/wxoLoader.js?embed=true`;
    script.async = true;
    script.onload = () => {
      try {
        // @ts-ignore
        window.wxoLoader?.init?.();
      } catch (e) {
        console.error("wxo init error", e);
      }
    };
    document.head.appendChild(script);

    return () => {
      try {
        (window as any).wxoLoader?.destroy?.();
      } catch (e) { }
      document.head.removeChild(script);
      try {
        delete (window as any).wxOConfiguration;
      } catch (e) { }
    };
  }, [host, orchestrationID, crn, agentId, agentEnvId]);

  return <div id="root" style={{ width: "100%", height: "100%" }} />;
}
