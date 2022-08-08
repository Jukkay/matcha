import { Request, Response } from "express";
import { execute } from "../utilities/SQLConnect";

const upload = async (req: Request, res: Response) => {
  if (!req.body.files) return
  console.log(req.body.files);
  return res.status(200).json({
    message: "Files uploaded",
    data: "empty",
  });
  };
  
const getImage = async (req: Request, res: Response) => {
    console.log("in getImage", req.get("authorization"));
    return res.status(200).json({
      message: "Message",
      data: "empty",
    });
  };
  
  const deleteImage = async (req: Request, res: Response) => {
    console.log("in deleteImage", req.get("authorization"));
    return res.status(200).json({
      message: "Message",
      data: "empty",
    });
  };
  
  export default { upload, getImage, deleteImage};
  