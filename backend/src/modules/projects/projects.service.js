import * as projectsRepository from "./projects.repository.js";
import { generateSlug } from "../../shared/utils/slug.js";
import NotFoundError from "../../shared/errors/notFound.error.js";
//import NotFoundError from '../../shared/errors/validation.error.js';

export const getAllProjects = async () => {
  return await projectsRepository.getAllProjects();
};

//el slug siempre sale del titulo, nunca del cliente. Como la columna es UNIQUE,
//dos titulos iguales chocarian, asi que se numera el repetido: -2, -3, etc.
const buildUniqueSlug = async (title, excludeId = null) => {
  const base = generateSlug(title) || "proyecto";

  let candidate = base;
  let suffix = 1;

  while (await projectsRepository.slugExists(candidate, excludeId)) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return candidate;
};

export const createProject = async (data) => {
  data.slug = await buildUniqueSlug(data.title);

  return await projectsRepository.createProject(data);
};

export const getProjectById = async (id) => {
  const project = await projectsRepository.getProjectById(id);

  if (!project) {
    throw new NotFoundError("Project not found");
  }

  return project;
};

export const updateProject = async (id, data) => {
  const existing = await projectsRepository.getProjectById(id);

  if (!existing) {
    throw new NotFoundError("Project not found");
  }

  //el slug sigue al titulo solo mientras nunca haya salido de borrador. El
  //bloqueo es permanente: una URL que ya pudo compartirse no se recicla nunca,
  //ni siquiera si el proyecto vuelve a borrador
  const titleChanged = Boolean(data.title) && data.title !== existing.title;

  const slug =
    titleChanged && !existing.slug_locked
      ? await buildUniqueSlug(data.title, id)
      : existing.slug;

  const updateData = {
    title: data.title ?? existing.title,
    slug,
    description: data.description ?? existing.description,
    year: data.year ?? existing.year,
    client: data.client ?? existing.client,
    cover_image_url: data.cover_image_url ?? existing.cover_image_url,
    sort_order: data.sort_order ?? existing.sort_order,
  };

  return await projectsRepository.updateProject(id, updateData);
};

export const deleteProject = async (id) => {
  const affected = await projectsRepository.deleteProject(id);

  if (affected === 0) {
    throw new NotFoundError("Project not found");
  }

  return true;
};

export const publishProject = async (id) => {
  const project = await projectsRepository.getProjectById(id);

  if (!project) {
    throw new NotFoundError("Project not found");
  }

  // if (!project.cover_image_url) {
  //     throw new ValidationError('Cover image required');
  // }

  return await projectsRepository.publishProject(id);
};

export const unlistProject = async (id) => {
  const project = await projectsRepository.getProjectById(id);

  if (!project) {
    throw new NotFoundError("Project not found");
  }

  return await projectsRepository.unlistProject(id);
};

export const unpublishProject = async (id) => {
  const project = await projectsRepository.getProjectById(id);

  if (!project) {
    throw new NotFoundError("Project not found");
  }

  return await projectsRepository.unpublishProject(id);
};

export const getPublishedProjects = async () => {
  return await projectsRepository.getPublishedProjects();
};

export const getPublicProjectBySlug = async (slug) => {
  const project = await projectsRepository.getPublicProjectBySlug(slug);

  //un borrador y un slug inexistente tienen que dar el mismo 404: si se
  //distinguen, cualquiera puede adivinar que borradores existen
  if (!project) {
    throw new NotFoundError("Project not found");
  }

  return project;
};
