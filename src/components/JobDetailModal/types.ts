import type { Job } from "@/types/job";

export interface JobDetailModalProps {
  job: Job | null;
  opened: boolean;
  onClose: () => void;
  onUpdate?: (updatedJob: Job) => void;
  onDelete?: (job: Job) => void;
}
