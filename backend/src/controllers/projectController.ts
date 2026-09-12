import { Request, Response } from "express";
import { ProjectModel } from "../models/Project";
import { isDbConnected, getLegacySeedData } from "../services/dataHelper";

export const getProjects = async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const projects = await ProjectModel.find().lean();
      return res.json(projects);
    }
    const seed = getLegacySeedData();
    return res.json(seed.projects || []);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch projects" });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const project = await ProjectModel.findOne({ id: req.params.id }).lean();
      if (project) return res.json(project);
    }
    const seed = getLegacySeedData();
    const found = (seed.projects || []).find((p: any) => p.id === req.params.id);
    if (found) return res.json(found);

    return res.status(404).json({ error: "Project not found" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch project detail" });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.id) data.id = `PROJ-${Date.now()}`;
    if (isDbConnected()) {
      const created = await ProjectModel.create(data);
      return res.status(201).json(created);
    }
    return res.status(201).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to create project" });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (isDbConnected()) {
      const updated = await ProjectModel.findOneAndUpdate({ id: req.params.id }, { $set: data }, { new: true });
      if (updated) return res.json(updated);
    }
    return res.json({ id: req.params.id, ...data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update project" });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      await ProjectModel.findOneAndDelete({ id: req.params.id });
    }
    return res.json({ success: true, message: "Project deleted successfully" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to delete project" });
  }
};
