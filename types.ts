
export enum DesignStyle {
  Modern = 'Modern',
  Minimalist = 'Minimalist',
  WabiSabi = 'Wabi-sabi',
  Zen = 'Zen',
  Japandi = 'Japandi',
  Nordic = 'Nordic'
}

export interface GeneratedSpace {
  id: string;
  type: string;
  url: string;
  isEnergyFlowActive: boolean;
}

export interface GenerationState {
  isGenerating: boolean;
  step: 'idle' | 'analyzing' | 'visualizing';
  uploadedImage: string | null;
  results: GeneratedSpace[];
  error: string | null;
}
