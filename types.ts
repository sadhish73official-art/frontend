export interface DuplicateBlock {
  count: number;
  example: string;
}

export interface SimilarBlock {
  similarity: number;
  block1: string;
  block2: string;
}

export interface DuplicateCodeResult {
  exact_duplicates: DuplicateBlock[];
  similar_blocks: SimilarBlock[];
}

// The Python re.findall returns an array of tuples (arrays in JSON) for passwords
// pattern: (password|passwd|pwd) and value group
export type PasswordTuple = [string, string];

export interface AnalysisResult {
  overview: string;
  language: string;
  framework: string;
  open_passwords: PasswordTuple[];
  open_keys: string[];
  optimization: string[];
  naming_conventions: string;
  indentation: string;
  lint_issues: string[];
  duplicate_code: DuplicateCodeResult;
  status: string;
  error?: string;
}

export type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';