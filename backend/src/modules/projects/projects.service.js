import * as projectsRepository from './projects.repository.js';
import { generateSlug } from '../../shared/utils/slug.js';
import NotFoundError from '../../shared/errors/notFound.error.js';
//import NotFoundError from '../../shared/errors/validation.error.js';

export const getAllProjects = async () => {
    return await projectsRepository.getAllProjects();
};

export const createProject = async (data) => {
    if (!data.slug) {
        data.slug = generateSlug(data.title);
    }

    return await projectsRepository.createProject(data);
};

export const getProjectById = async (id) => {
    const project = await projectsRepository.getProjectById(id);

    if (!project) {
        throw new NotFoundError('Project not found');
    }

    return project;
};

export const updateProject = async (id, data) => {
    const existing = await projectsRepository.getProjectById(id);

    if (!existing) {
        throw new NotFoundError('Project not found');
    }

    if (data.title && !data.slug) {
        data.slug = generateSlug(data.title);
    }

    const updateData = {
        title: data.title ?? existing.title,
        slug: data.slug ?? existing.slug,
        description: data.description ?? existing.description,
        year: data.year ?? existing.year,
        client: data.client ?? existing.client,
        cover_image_url: data.cover_image_url ?? existing.cover_image_url,
    }

    return await projectsRepository.updateProject(id, updateData);
};

export const deleteProject = async (id) => {
    const affected = await projectsRepository.deleteProject(id);

    if (affected === 0) {
        throw new NotFoundError('Project not found');
    }

    return true;
};

export const publishProject = async (id) => {
    const project = await projectsRepository.getProjectById(id);

    if (!project) {
        throw new NotFoundError('Project not found');
    }

    // if (!project.cover_image_url) {
    //     throw new ValidationError('Cover image required');
    // }

    return await projectsRepository.publishProject(id);
};

export const unpublishProject = async (id) => {
    const project = await projectsRepository.getProjectById(id);

    if (!project) {
        throw new NotFoundError('Project not found');
    }

    return await projectsRepository.unpublishProject(id);
};