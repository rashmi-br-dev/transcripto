import React from 'react';
import { TEXT } from "./i18n/constants";
import { t } from "./i18n";
function App() {
  return <div>
      <h1>{t(TEXT.WELCOME_TO_MY_APPLICATION)}</h1>
      <p>{t(TEXT.PLEASE_LOGIN_TO_CONTINUE)}</p>
      <button>{t(TEXT.LOGIN)}</button>
      <button>{t(TEXT.SIGN_UP)}</button>
      <button>{t(TEXT.FORGOT_PASSWORD)}</button>
    </div>;
}
export default App;