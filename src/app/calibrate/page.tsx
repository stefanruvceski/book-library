import type { Metadata } from "next";

import { Calibrator } from "./calibrator";

export const metadata: Metadata = {
  title: "Calibrate scene · The Dark Library",
  robots: { index: false, follow: false },
};

export default function CalibratePage() {
  return <Calibrator />;
}
