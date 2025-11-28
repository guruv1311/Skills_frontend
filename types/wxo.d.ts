// // export { };
// // declare global {
// //   interface Window {
// //     wxOConfiguration: any;
// //     wxoLoader?: {
// //       init: () => void;
// //       destroy?: () => void;
// //     };
// //     wxoChatInstance?: any;
// //     onChatLoad?: (instance: any) => void;
// //   }
// // }
// // global.d.ts
// export { }; // make this file a module to avoid polluting global scope

// declare global {
//   interface Window {
//     // configuration object set before loader init
//     wxOConfiguration?: {
//       orchestrationID?: string;
//       hostURL?: string;
//       rootElementID?: string;
//       deploymentPlatform?: string;
//       crn?: string;
//       chatOptions?: {
//         agentId?: string;
//         agentEnvironmentId?: string;
//         [key: string]: any;
//       };
//       token?: string;
//       [key: string]: any;
//     };

//     // loader and runtime objects added by the SDK
//     wxoLoader?: {
//       init?: () => void;
//       destroy?: () => void;
//       [key: string]: any;
//     };

//     onChatLoad?: (instance: any) => void;
//     wxoChatInstance?: any;

//     // keep index signature for safety if other libs attach things
//     [key: string]: any;
//   }
// }
