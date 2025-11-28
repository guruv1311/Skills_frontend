// // app/components/WatsonxChatWidget.tsx
// "use client";

// import React, { useEffect, useState } from "react";

// declare global {
//   interface Window {
//     wxOConfiguration?: any;
//     wxoLoader?: any;
//     wxoChatInstance?: any;
//   }
// }

// type Props = {
//   userId?: string;
//   hostURL?: string;
//   rootElementID?: string;
// };

// function setCookie(name: string, value: string, days = 365) {
//   const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
//   document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires};`;
// }
// function getCookie(name: string) {
//   const v = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
//   return v ? decodeURIComponent(v.pop() || "") : undefined;
// }

// export default function WatsonxChatWidget({
//   userId = "anonymous@ibm.com",
//   hostURL = "https://us-south.watson-orchestrate.cloud.ibm.com",
//   rootElementID = "wxo-root",
// }: Props) {
//   const [status, setStatus] = useState({
//     token: "idle",
//     script: "idle",
//     instance: "idle",
//     error: "" as string,
//   });

//   useEffect(() => {
//     let mounted = true;

//     function debugSet(partial: Partial<typeof status>) {
//       if (!mounted) return;
//       setStatus((s) => ({ ...s, ...partial }));
//     }

//     async function fetchToken() {
//       debugSet({ token: "fetching" });
//       try {
//         const resp = await fetch(`/api/createJWT?user_id=${encodeURIComponent(userId)}`);
//         if (!resp.ok) {
//           const text = await resp.text();
//           throw new Error(`Token fetch failed: ${resp.status} ${text}`);
//         }
//         const body = await resp.json().catch(() => null);
//         // Accept both { token } or raw string
//         let token = body?.token ?? (typeof body === "string" ? body : null);
//         // If API returned plain string e.g., "eyJ..."
//         if (!token) {
//           // fallback: try reading text
//           const txt = await resp.text();
//           if (txt && txt.length > 20) token = txt;
//         }
//         if (!token) throw new Error("No token in response");
//         debugSet({ token: "ok" });

//         // set up the global config BEFORE loader init
//         window.wxOConfiguration = {
//           orchestrationID:
//             "9ebe1d729e764a84830627874c472721_558ea936-b88b-41fd-ac1b-13cd7cfb8475",
//           hostURL,
//           rootElementID,
//           deploymentPlatform: "ibmcloud",
//           crn:
//             "crn:v1:bluemix:public:watsonx-orchestrate:us-south:a/9ebe1d729e764a84830627874c472721:558ea936-b88b-41fd-ac1b-13cd7cfb8475::",
//           chatOptions: {
//             agentId: "294fde26-c764-4d91-a743-a36c86b9eece",
//             agentEnvironmentId: "5e506486-7e2c-49e5-b786-7dfe671e9493",
//           },
//           token,
//         };

//         return token;
//       } catch (err: any) {
//         console.error("fetchToken error:", err);
//         debugSet({ token: "error", error: String(err) });
//         throw err;
//       }
//     }

//     function attachScript() {
//       debugSet({ script: "loading" });
//       return new Promise<void>((resolve, reject) => {
//         try {
//           // avoid duplicate
//           const existing = document.querySelector(`script[data-wxo-loader]`);
//           if (existing) {
//             debugSet({ script: "loaded" });
//             return resolve();
//           }
//           const s = document.createElement("script");
//           s.async = true;
//           s.setAttribute("data-wxo-loader", "true");
//           s.src = `${hostURL}/wxochat/wxoLoader.js?embed=true`;
//           s.onload = () => {
//             debugSet({ script: "loaded" });
//             resolve();
//           };
//           s.onerror = (e) => {
//             const msg = `Failed to load loader from ${s.src}`;
//             console.error(msg, e);
//             debugSet({ script: "error", error: msg });
//             reject(new Error(msg));
//           };
//           document.head.appendChild(s);
//         } catch (e) {
//           reject(e);
//         }
//       });
//     }

//     function registerInstanceEvents(instance: any) {
//       if (!instance || typeof instance.on !== "function") return;
//       if ((instance as any).__wxo_listeners_attached) return;
//       instance.on("pre:send", (ev: any) => {
//         if (ev?.message?.content) ev.message.content = ev.message.content.toUpperCase();
//       });
//       instance.on("send", (ev: any) => console.log("send", ev));
//       instance.on("pre:receive", (ev: any) => {
//         if (Array.isArray(ev?.content)) ev.content.forEach((c: any) => (c.type = "date"));
//       });
//       instance.on("receive", (ev: any) => console.log("receive", ev));
//       instance.on("feedback", (ev: any) => console.log("feedback", ev));
//       instance.on("userDefinedResponse", (ev: any) => {
//         console.log("userDefinedResponse", ev);
//         try {
//           if (ev?.hostElement) {
//             ev.hostElement.innerHTML = `<div style="background:orange;color:white;padding:10px;">DEBUG UDR: ${(ev.contentItem?.template) || "[no content]"}</div>`;
//           }
//         } catch (e) { }
//       });
//       (instance as any).__wxo_listeners_attached = true;
//     }

//     async function initWidget() {
//       try {
//         // create or ensure root element exists
//         let rootEl = document.getElementById(rootElementID);
//         if (!rootEl) {
//           rootEl = document.createElement("div");
//           rootEl.id = rootElementID;
//           // append to body so loader has a place to attach
//           document.body.appendChild(rootEl);
//         }

//         await fetchToken();
//         await attachScript();

//         // Some loaders initialize automatically; call init if available
//         try {
//           if ((window as any).wxoLoader && typeof (window as any).wxoLoader.init === "function") {
//             (window as any).wxoLoader.init();
//           }
//         } catch (e) { console.warn("wxoLoader.init() failed", e); }

//         // Now attempt to attach to the instance (polling fallback)
//         let tries = 0;
//         const maxTries = 40;
//         const poll = setInterval(() => {
//           tries++;
//           const inst = (window as any).wxoChatInstance || (window as any).wxoLoader?.instance || null;
//           if (inst) {
//             clearInterval(poll);
//             registerInstanceEvents(inst);
//             debugSet({ instance: "attached" });
//             console.log("wxo instance attached:", inst);
//           } else if (tries >= maxTries) {
//             clearInterval(poll);
//             const msg = "Could not find wxo chat instance after polling.";
//             console.error(msg);
//             debugSet({ instance: "error", error: msg });
//           } else {
//             // still polling
//             debugSet({ instance: `polling ${tries}` });
//           }
//         }, 300);
//       } catch (err: any) {
//         console.error("initWidget error", err);
//         setTimeout(() => { }, 0);
//       }
//     }

//     initWidget();

//     return () => {
//       mounted = false;
//       // cleanup listeners if possible
//       try {
//         const inst = (window as any).wxoChatInstance;
//         if (inst && inst.off) {
//           inst.off("pre:send");
//           inst.off("send");
//           inst.off("pre:receive");
//           inst.off("receive");
//           inst.off("feedback");
//           inst.off("userDefinedResponse");
//         }
//       } catch (e) { }
//     };
//   }, [userId, hostURL, rootElementID]);

//   return <div id={rootElementID} />;
// }
// app/components/WatsonxChatWidget.tsx
"use client";

import React, { useEffect, useState } from "react";

declare global {
  interface Window {
    wxOConfiguration?: any;
    wxoLoader?: any;
    wxoChatInstance?: any;
  }
}

type Props = {
  userId?: string;
  role?: string;
  hostURL?: string;
  rootElementID?: string;
};

export default function WatsonxChatWidget({
  userId = 'anonymous',
  role = "anonymous",
  hostURL = "https://us-south.watson-orchestrate.cloud.ibm.com",
  rootElementID = "wxo-root",
}: Props) {
  const [status, setStatus] = useState({
    token: "idle",
    script: "idle",
    instance: "idle",
    error: "" as string,
  });

  useEffect(() => {
    let mounted = true;

    function setPartial(partial: Partial<typeof status>) {
      if (!mounted) return;
      setStatus((s) => ({ ...s, ...partial }));
    }

    async function fetchToken() {
      setPartial({ token: "fetching" });
      try {
        // include role in query params
        const url = `/api/createJWT?user_id=${encodeURIComponent(userId)}&role=${encodeURIComponent(role)}`;
        const resp = await fetch(url);
        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error(`Token fetch failed: ${resp.status} ${txt}`);
        }

        // accept either JSON { token } or plaintext
        const maybeJson = await resp.clone().json().catch(() => null);
        let token = maybeJson?.token ?? null;
        if (!token) {
          const txt = await resp.text();
          if (txt && txt.length > 20) token = txt;
        }
        if (!token) throw new Error("No token in response");

        // set global config BEFORE loader init
        window.wxOConfiguration = {
          orchestrationID:
            "9ebe1d729e764a84830627874c472721_558ea936-b88b-41fd-ac1b-13cd7cfb8475",
          hostURL,
          rootElementID,
          deploymentPlatform: "ibmcloud",
          crn:
            "crn:v1:bluemix:public:watsonx-orchestrate:us-south:a/9ebe1d729e764a84830627874c472721:558ea936-b88b-41fd-ac1b-13cd7cfb8475::",
          chatOptions: {
            agentId: "04ca8a1d-30b9-4b9d-b786-bc5ffdeed3b0",
            agentEnvironmentId: "cd7df371-bb51-49cb-8343-7dbd22e64b06",
          },
          token,
        };

        setPartial({ token: "ok" });
        return token;
      } catch (err: any) {
        console.error("fetchToken error:", err);
        setPartial({ token: "error", error: String(err) });
        throw err;
      }
    }

    function attachScript() {
      setPartial({ script: "loading" });
      return new Promise<void>((resolve, reject) => {
        try {
          const existing = document.querySelector(`script[data-wxo-loader]`);
          if (existing) {
            setPartial({ script: "loaded" });
            resolve();
            return;
          }
          const s = document.createElement("script");
          s.async = true;
          s.setAttribute("data-wxo-loader", "true");
          s.src = `${hostURL}/wxochat/wxoLoader.js?embed=true`;
          s.onload = () => {
            setPartial({ script: "loaded" });
            resolve();
          };
          s.onerror = (e) => {
            const msg = `Failed to load loader from ${s.src}`;
            console.error(msg, e);
            setPartial({ script: "error", error: msg });
            reject(new Error(msg));
          };
          document.head.appendChild(s);
        } catch (e) {
          reject(e);
        }
      });
    }

    async function initWidget() {
      try {
        // ensure a DOM node exists for the loader
        if (!document.getElementById(rootElementID)) {
          const d = document.createElement("div");
          d.id = rootElementID;
          document.body.appendChild(d);
        }

        await fetchToken();
        await attachScript();

        // call loader init if available
        try {
          if ((window as any).wxoLoader?.init) {
            (window as any).wxoLoader.init();
          }
        } catch (e) {
          console.warn("wxoLoader.init failed", e);
        }

        // poll for instance and attach lightweight listeners
        let tries = 0;
        const maxTries = 40;
        const interval = setInterval(() => {
          tries++;
          const inst = (window as any).wxoChatInstance || (window as any).wxoLoader?.instance;
          if (inst) {
            clearInterval(interval);
            setPartial({ instance: "attached" });
            try {
              if (!inst.__listeners_attached) {
                inst.on?.("send", (ev: any) => console.log("wxo send", ev));
                inst.on?.("receive", (ev: any) => console.log("wxo receive", ev));
                inst.__listeners_attached = true;
              }
            } catch (e) { }
          } else if (tries >= maxTries) {
            clearInterval(interval);
            setPartial({ instance: "error", error: "No instance found" });
          } else {
            setPartial({ instance: `poll ${tries}` });
          }
        }, 300);
      } catch (err: any) {
        console.error("initWidget error:", err);
      }
    }

    initWidget();

    return () => {
      // cleanup if needed
    };
  }, [userId, role, hostURL, rootElementID]);

  // Render a root node + small debug panel so the component definitely returns JSX
  return (
    <>
      <div id={rootElementID} />
    </>
  );
}
