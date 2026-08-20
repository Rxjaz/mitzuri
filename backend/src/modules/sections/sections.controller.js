import * as sectionsService from "./sections.service.js";

export const getByProject = async (req, res, next) => {
  try {
    const sections = await sectionsService.getProjectSections(
      req.params.projectId
    );
    res.json(sections);
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const section = await sectionsService.createSection(
      req.params.projectId,
      req.body
    );
    res.status(201).json(section);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const section = await sectionsService.updateSection(
      req.params.id,
      req.body
    );
    res.json(section);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await sectionsService.deleteSection(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const reorder = async (req, res, next) => {
  try {
    const sections = await sectionsService.reorderSections(
      req.params.projectId,
      req.body.ids
    );
    res.json(sections);
  } catch (error) {
    next(error);
  }
};
