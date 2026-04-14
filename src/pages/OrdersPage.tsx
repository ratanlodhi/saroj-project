import { Navigate } from 'react-router-dom';

/** Order list lives on the profile page; keep this route for bookmarks and links. */
export default function OrdersPage() {
  return <Navigate to="/profile?tab=orders" replace />;
}
