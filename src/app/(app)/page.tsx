import { redirect } from "next/navigation";

// `/` is the wallet — exactly as Todos' root redirects to /todos (SPEC).
export default function HomePage() {
  redirect("/cards");
}
