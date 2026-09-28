import type { Metadata } from "next";
import { ProductsAdmin } from "./ProductsAdmin";

export const metadata: Metadata = { title: "Manage Products" };

export default function AdminProductsPage() {
  return <ProductsAdmin />;
}
