import * as sectionsRepository from "./sections.repository.js";
import * as projectsRepository from "../projects/projects.repository.js";
import NotFoundError from "../../shared/errors/notFound.error.js";
import ValidationError from "../../shared/errors/validation.error.js";

const findProjectOrFail = async (projectId) => {
  const project = await projectsRepository.getProjectById(projectId);

  if (!project) {
    throw new NotFoundError("Project not found");
  }

  return project;
};

const findSectionOrFail = async (id) => {
  const section = await sectionsRepository.getById(id);

  if (!section) {
    throw new NotFoundError("Section not found");
  }

  return section;
};

export const getProjectSections = async (projectId) => {
  await findProjectOrFail(projectId);

  return await sectionsRepository.getByProject(projectId);
};

export const createSection = async (projectId, data) => {
  await findProjectOrFail(projectId);

  const position = (await sectionsRepository.getMaxPosition(projectId)) + 1;

  return await sectionsRepository.create(
    projectId,
    data.type,
    data.content,
    position
  );
};

export const updateSection = async (id, data) => {
  await findSectionOrFail(id);

  return await sectionsRepository.update(id, data.content);
};

export const deleteSection = async (id) => {
  const section = await findSectionOrFail(id);

  await sectionsRepository.remove(id);
  await sectionsRepository.compactPositions(section.project_id);

  return true;
};

export const reorderSections = async (projectId, ids) => {
  await findProjectOrFail(projectId);

  const sections = await sectionsRepository.getByProject(projectId);

  //los ids tienen que ser exactamente los del proyecto: sin esta comprobacion
  //se pueden colar ids de otro proyecto y corromper el orden
  const current = new Set(sections.map((section) => section.id));
  const received = new Set(ids);

  const sameSize =
    received.size === ids.length && received.size === current.size;

  const sameIds =
    sameSize && ids.every((id) => current.has(id));

  if (!sameIds) {
    throw new ValidationError(
      "Reorder must include every section of the project, exactly once"
    );
  }

  await sectionsRepository.reorder(projectId, ids);

  return await sectionsRepository.getByProject(projectId);
};
