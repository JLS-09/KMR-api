import mongoose from "mongoose";

const ModSchema = new mongoose.Schema({
  identifier: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  abstract: { type: String, required: true},
  author: { type: mongoose.Schema.Types.Mixed, required: true }, // String or [String]
  description: String,
  release_status: { type: String, enum: ["stable", "testing", "development"], default: "stable" },
  tags: [String],
  resources: {
    homepage: String,
    bugtracker: String,
    discussions: String,
    license: String,
    repository: String,
    ci: String,
    spacedock: String,
    curse: String,
    manual: String,
    metanetkan: String,
    'remote-avc': String,
    'remote-swinfo': String,
    store: String,
    steamstore: String,
    gogstore: String,
    epicstore: String,
  },
});

export const Mod = mongoose.model("Mod", ModSchema);
