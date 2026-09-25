import RequireUnlock from "@/components/RequireUnlock";
import VideoPlayer from "@/components/VideoPlayer";
import { getVideoSrc } from "@/lib/video";

export const dynamic = "force-dynamic";

export default function VideoPage() {
  const src = getVideoSrc();

  return (
    <RequireUnlock>
      <VideoPlayer src={src} />
    </RequireUnlock>
  );
}
