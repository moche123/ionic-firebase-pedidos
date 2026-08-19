// Real Firebase backend. This is the project used during development of this
// repo — replace firebaseConfig with your own project's config (Firebase
// Console -> Project settings -> Your apps) before deploying your own copy.
// A Firebase web config is not a secret: access is controlled by your
// Firestore/Storage/Auth security rules, not by hiding these values.
export const environment = {
  production: false,
  useMock: false,
  firebaseConfig: {
    apiKey: 'AIzaSyD_Q71_GtRwI4F8LtMTh_mA_u6rgn5ztYA',
    authDomain: 'deliverapp-322703.firebaseapp.com',
    projectId: 'deliverapp-322703',
    storageBucket: 'deliverapp-322703.appspot.com',
    messagingSenderId: '744692309346',
    appId: '1:744692309346:web:757fe432c30ea71c87a03b',
  },
};
