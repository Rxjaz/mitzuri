import * as mediaService from "./media.service.js";

export const create = async (req, res, next) => {
  try {
    const asset = await mediaService.uploadMedia(req.file, req.body.alt_text);
    res.status(201).json(asset);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const asset = await mediaService.updateAltText(
      req.params.id,
      req.body.alt_text
    );
    res.json(asset);
  } catch (error) {
    next(error);
  }
};
