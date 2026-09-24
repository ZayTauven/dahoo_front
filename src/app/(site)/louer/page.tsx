import type { Metadata } from "next";

import { listingsMetadata } from "../_annonces/data";
import type { RawSearchParams } from "../_annonces/filters";
import { ListingsScreen } from "../_annonces/ListingsScreen";

type Props = { searchParams: Promise<RawSearchParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return listingsMetadata("RENT", await searchParams);
}

/** Biens à louer : liste filtrable des annonces de location publiées par les agences partenaires. */
export default async function RentListingsPage({ searchParams }: Props) {
  return <ListingsScreen listingType="RENT" searchParams={await searchParams} />;
}
