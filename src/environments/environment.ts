// Default environment: mock backend, no Firebase project required.
// `ng serve -c firebase` / `npm run start:firebase` swaps this file for
// environment.firebase.ts (see angular.json "firebase" configuration).
export const environment = {
  production: false,
  useMock: true,
  firebaseConfig: null,
};
