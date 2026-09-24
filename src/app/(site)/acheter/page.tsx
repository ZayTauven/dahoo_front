import type { Metadata } from "next";

import { listingsMetadata } from "../_annonces/data";
import type { RawSearchParams } from "../_annonces/filters";
import { ListingsScreen } from "../_annonces/ListingsScreen";

type Props = { searchParams: Promise<RawSearchParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return listingsMetadata("SALE", await searchParams);
}

/** Biens à vendre : liste filtrable des annonces de vente publiées par les agences partenaires. */
export default async function SaleListingsPage({ searchParams }: Props) {
  return <ListingsScreen listingType="SALE" searchParams={await searchParams} />;
}
