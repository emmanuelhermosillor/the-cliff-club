"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass });
    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }
    router.replace("/cotizador");
    router.refresh();
  }

  return (
    <div className="login">
      <form className="card" onSubmit={signIn}>
        <img className="wm" src="/brand/wordmark_blue.svg" alt="The Cliff Club Residences" style={{ width: 240, height: "auto" }} />
        <div className="sub">Cotizador &amp; CRM · Acceso privado</div>
        <div className="field">
          <label htmlFor="li-email">Correo</label>
          <input id="li-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="li-pass">Contraseña</label>
          <input id="li-pass" type="password" autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} required />
        </div>
        <button className="btn" style={{ width: "100%" }} disabled={busy}>
          {busy ? "Entrando…" : "Entrar"}
        </button>
        <div className="err">{err}</div>
      </form>
    </div>
  );
}
