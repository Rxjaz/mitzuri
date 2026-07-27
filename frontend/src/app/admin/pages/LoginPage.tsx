import { useState } from "react";
import { useLocation, useNavigate, type Location } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  //si el guard redirigio hasta aqui, se vuelve a la ruta original
  const from = (location.state as { from?: Location } | null)?.from?.pathname;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      await login(email, password);

      navigate(from ?? "/admin", { replace: true });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unexpected error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-center">
        <Card className="auth-card">
          <form onSubmit={handleSubmit}>
            <div className="auth-header">
              <h1 className="auth-title">Login</h1>
              <p className="auth-subtitle">Administracion</p>
            </div>

            <div className="form-field">
              <label className="form-label">Email</label>
              <Input
                type="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label">Password</label>
              <Input
                type="password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Loading..." : "Login"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
