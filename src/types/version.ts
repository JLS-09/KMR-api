import mongoose from "mongoose";

export type VersionUpdate = {
  spec_version: mongoose.Schema.Types.Mixed,
  _id: string,
  identifier: string,
  download: mongoose.Schema.Types.Mixed,
  license: mongoose.Schema.Types.Mixed,
  version: string,
  install: mongoose.Schema.Types.Mixed[],
  comment: string,
  ksp_version: string,
  ksp_version_min: string,
  ksp_version_max: string,
  ksp_version_strict: boolean,
  localizations: string[],
  download_size: number,
  download_hash: {
    sha1: string,
    sha256: string,
  },
  download_content_type: string,
  install_size: number,
  release_date: Date,
  depends: mongoose.Schema.Types.Mixed[],
  recommends: mongoose.Schema.Types.Mixed[],
  suggests: mongoose.Schema.Types.Mixed[],
  supports: mongoose.Schema.Types.Mixed[],
  conflicts: mongoose.Schema.Types.Mixed[],
  replaced_by: {
    name: string,
    version: string,
    min_version: string,
  },
  kind: string,
  provides: string[],
}
