import * as projectsService from "./projects.service.js";

export const getAll = async (req, res, next) => {
  try {
    const projects = await projectsService.getAllProjects();
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const project = await projectsService.createProject(req.body);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const project = await projectsService.getProjectById(req.params.id);
    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const project = await projectsService.updateProject(req.params.id, req.body);
    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await projectsService.deleteProject(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const publish = async (req, res, next) => {
  try {
    const project = await projectsService.publishProject(req.params.id);
    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const unpublish = async (req, res, next) => {
  try {
    const project = await projectsService.unpublishProject(req.params.id);
    res.json(project);
  } catch (error) {
    next(error);
  }
};