import PhotoAlbum from "@/components/PhotoAlbum";
import RequireUnlock from "@/components/RequireUnlock";
import { getGalleryPages } from "@/lib/gallery";

export const dynamic = "force-dynamic";

export default function GalleryPage() {
  const pages = getGalleryPages();

  return (
    <RequireUnlock>
      <PhotoAlbum pages={pages} />
    </RequireUnlock>
  );
}
