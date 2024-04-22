const CMS = require("../../../models/cms");
const SendResponse = require("../../../apiHandler");
const Event = require("../../../models/event");
const Sport = require("../../../models/sport");
const Member = require("../../../models/member");
const User = require("../../../models/user");
const {dump}=require("../../../services/dump");
const FileUpload = require("../../../services/upload-file");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const {
    Validator
} = require("node-input-validator");
const mail = require("../../../services/mailServices");
const Chat = require("../../../models/chat");
const ChatMessage = require("../../../models/chatmessage"); 
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require("path");
const videoExtns = [ '.mp4','.webm','.ogg','.mov','.avi','.mkv' ]

const generateThumbnail = async (videoPath, thumbnailPath, callback) => {
    return new Promise((resolve, reject) => {
        const command = ffmpeg(videoPath);
        command.seekInput(5).frames(1).on('end', () => {
            console.log('Thumbnail created successfully');
            resolve();
        }).on('error', (err) => {
            console.error('Error generating thumbnail:', err);
            reject(err);
        }).save(thumbnailPath);
    });
}

module.exports = {
    getCms: async (req, res) => {
        try {           
            let cms = await CMS.findOne({
                userType: req.query.userType,
                type: req.query.type
            }, {
                _id: 1,
                userType: 1,
                type: 1,
                slug: 1,
                description: 1,
                updatedAt: 1
            });
            return SendResponse(
                res, {
                    cms: cms
                },
                "cms data",
                200
            );
        } catch (error) {
            dump(error);
            return SendResponse(
                res, {
                    isBoom: true
                },
                "Something went wrong,please try again",
                500
            );
        }
    },

    uploadMedia: async (req,res) => {
        try{
            let medias = [];
            if (req.files && req.files.media) {
                if (Array.isArray(req.files.media)) {
                  for await (const media of req.files.media) {
                    let mediaKey = await FileUpload.awsOriginalName(media);
                    const ext = path.extname(media.name);
                    let thumbnail = '';
                    const thumbnailPath = 'public/images/thumbnails/' + Date.now() +'.png';
                    if(videoExtns.includes(ext)){
                        const videoPath = process.env.AWS_URL + mediaKey.Key;
                        await generateThumbnail(videoPath, thumbnailPath)
                        let thumbnailKey = await FileUpload.awsLocalFile(thumbnailPath);
                        thumbnail = process.env.AWS_URL + thumbnailKey.Key
                    }
                    medias.push({ 
                    link : process.env.AWS_URL + mediaKey.Key, 
                    name : mediaKey.originalName,
                    thumbnail : thumbnail
                    });
                    if( thumbnail != ''){
                        fs.access(thumbnailPath, (error) => {
                            if (!error) {
                            fs.unlinkSync(thumbnailPath, function (error) {
                                dump(error);
                            });
                            } else {
                            dump(error, "not error");
                            }
                        });
                    }
                   }
                } else {
                  let mediaKey = await FileUpload.awsOriginalName(req.files.media);
                  const ext = path.extname(req.files.media.name);
                  let thumbnail = '';
                  const thumbnailPath = 'public/images/thumbnails/' + Date.now() +'.png';
                  if(videoExtns.includes(ext)){
                    const videoPath = process.env.AWS_URL + mediaKey.Key;
                    await generateThumbnail(videoPath, thumbnailPath)
                    let thumbnailKey = await FileUpload.awsLocalFile(thumbnailPath);
                    thumbnail = process.env.AWS_URL + thumbnailKey.Key
                  }
                  medias.push({ 
                    link : process.env.AWS_URL + mediaKey.Key, 
                    name : mediaKey.originalName,
                    thumbnail : thumbnail
                  });
                  if( thumbnail != ''){
                    fs.access(thumbnailPath, (error) => {
                        if (!error) {
                        fs.unlinkSync(thumbnailPath, function (error) {
                            dump(error);
                        });
                        } else {
                        dump(error, "not error");
                        }
                    });
                }
                }
            }
              
            return SendResponse(
                res, {
                    media: medias
                },
                "Media uploaded",
                200
            );
        } catch (error) {
            dump(error);
            return SendResponse(
                res, {
                    isBoom: true
                },
                "Something went wrong,please try again",
                500
            );
        }

    },


    getRoomMembersList: async(req,res) => {
        try{
            const chatExist = await Chat.findOne({ roomId : Number(req.params.id)});
            if(!chatExist){
                return SendResponse(
                    res, { isBoom: true },
                    "No chat found",
                    422
                );
            }

            let chatDetails = await Chat.aggregate([
                {
                    $match : { roomId : Number(req.params.id)}
                },
                {
                    $lookup : {
                        from : "users",
                        let : { 'userIds' : '$members'},
                        pipeline: [
                            { $match : {
                                $expr: {
                                   $in : [ '$_id', '$$userIds']
                                }
                              }
                            },
                            {
                              $project : {
                                _id : 1,
                                fullName : 1,
                                userType : "user"
                              }
                            }
                        ],
                        as : "userDetails"
                    }
                },
                {
                    $lookup : {
                        from : "users",
                        let : { 'adminIds' : '$admins'},
                        pipeline: [
                            { $match : {
                                $expr: {
                                   $in : [ '$_id', '$$adminIds']
                                }
                              }
                            },
                            {
                              $project : {
                                _id : 1,
                                fullName : 1,
                                userType : "user"
                              }
                            }
                        ],
                        as : "adminDetails"
                    }
                },
                {
                    $lookup : {
                        from : "facilities",
                        let : { 'adminIds' : '$admins'},
                        pipeline: [
                            { $match : {
                                $expr: {
                                   $in : [ '$_id', '$$adminIds']
                                }
                              }
                            },
                            {
                              $project : {
                                _id : 1,
                                fullName : "$name",
                                userType : "facility"
                              }
                            }
                        ],
                        as : "facilityAdminDetails"
                    }
                },
               
            ]);
            let combinedArray = [...chatDetails[0].userDetails, ...chatDetails[0].facilityAdminDetails];
            return SendResponse(
                res, {
                    membersList: combinedArray
                },
                "Members list",
                200
            );
        } catch (error) {
            dump(error);
            return SendResponse(
                res, {
                    isBoom: true
                },
                "Something went wrong,please try again",
                500
            );
        }
    }

}