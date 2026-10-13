import { auth, authReady } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

export const ADMIN_EMAIL = "z1wae12008@gmail.com";

export function isAuthorizedAdmin(user) {
  return Boolean(
    user &&
    user.email &&
    user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );
}

export async function requireAdmin() {
  await authReady;

  return new Promise(resolve => {
    let unsubscribe = null;
    let finished = false;

    const finish = async user => {
      if (finished) return;
      finished = true;
      if (unsubscribe) unsubscribe();

      if (!isAuthorizedAdmin(user)) {
        if (user) {
          try {
            await signOut(auth);
          } catch (error) {
            console.error(error);
          }
        }

        location.replace("./index.html");
        resolve(null);
        return;
      }

      resolve(user);
    };

    unsubscribe = onAuthStateChanged(
      auth,
      user => finish(user),
      error => {
        console.error(error);
        finish(null);
      }
    );

    // لو الـ callback اتنادى قبل ما unsubscribe يتعرف
    if (finished) unsubscribe();
  });
}
