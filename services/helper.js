const mongoose = require("mongoose");
const User = require("../models/user");
const UserTeam = require("../models/userteam");
const UserEvent = require("../models/event");
const Member = require("../models/member");
const Chat = require("../models/chat");
const {dump} = require("../services/dump");
const SendResponse = require("../apiHandler");
const ObjectId = mongoose.Types.ObjectId;
module.exports = {
    changeStatus: async (id,status,mode) => {

        if(status == "false"){ 
            let members = await Member.find({
              memberId: ObjectId(id),
              isTeamMember: true,
              status: true
            });
            let teamIds = [];
            members.forEach(member => {
              if (teamIds.length && !teamIds.find(item => item == member.teamId)){
                teamIds.push( member.teamId)
              }else if(!teamIds.length){
                teamIds.push( member.teamId)
              }
            });
            if( teamIds.length ){
                await UserTeam.updateMany({
                $or: [
                    {
                    user_id: ObjectId(id),
                    },
                    {
                    $expr: {
                        $in: [ObjectId(id), "$members"],
                    },
                    },
                    {
                    _id: {
                        $in: teamIds.map(id => ObjectId(id)),
                    },
                    },
                ],
                },{
                $pull: {
                    admins: ObjectId(id),
                    members: ObjectId(id),
                },
                });
            }

            // Update Events Members

            let eventMembers = await Member.find({
                memberId: ObjectId(id),
                isEventMember: true,
                status: true
              });
              let eventIds = [];
              eventMembers.forEach(member => {
                if (eventIds.length && !eventIds.find(item => item == member.eventId)){
                  eventIds.push( member.eventId)
                }else if(!eventIds.length){
                  eventIds.push( member.eventId)
                }
              });
              if( eventIds.length){
                await UserEvent.updateMany({
                    $or: [
                    {
                        creatorId: ObjectId(id),
                    },
                    {
                        $expr: {
                        $in: [ObjectId(id), "$members"],
                        },
                    },
                    {
                        _id: {
                        $in: eventIds.map(id => ObjectId(id)),
                        },
                    },
                    ],
                },{
                    $pull: {
                    admins: ObjectId(id),
                    members: ObjectId(id),
                    },
                });
              }
        }else{
        const membersList = await Member.find({
        isTeamMember : true,
        memberId : ObjectId(id),
        status : false
        });
        let teamIds = [];
        membersList.forEach(member => {
            if (teamIds.length &&!teamIds.find(item => (item.teamId) == (member.teamId))){
              teamIds.push( {teamId : member.teamId, isAdmin : member.isAdmin});
            }else if(!teamIds.length){
                teamIds.push( {teamId : member.teamId, isAdmin : member.isAdmin});
            }
        });
        if(teamIds.length){
            const adminTeamIds = teamIds
            .filter(item => item.isAdmin)
            .map(team => ObjectId(team.teamId));
            await UserTeam.updateMany({
                _id : { $in : teamIds.map((team) => ObjectId(team.teamId)) }
            },{
                $push : {
                members : ObjectId(id)
                }
            }
            );

            await UserTeam.updateMany({
                _id : { $in : adminTeamIds.map((teamId) => ObjectId(teamId))}
            },{
                $push : {
                admins : ObjectId(id)
                }
            }
            );
        }
        // Update Event Members
        const eventMembersList = await Member.find({
        isEventMember : true,
        memberId : ObjectId(id),
        status : false
        });
        let eventIds = [];
        membersList.forEach(member => {
            if (eventIds.length &&!eventIds.find(item => (item.eventId) == (member.eventId))){
                eventIds.push( {eventId : member.eventId, isAdmin : member.isAdmin});
            }else if(!eventIds.length){
                eventIds.push( {eventId : member.eventId, isAdmin : member.isAdmin});
            }
        });
        if(eventIds.length){
            const adminEventIds = eventIds
            .filter(item => item.isAdmin)
            .map(event => ObjectId(event.eventId));
            await UserEvent.updateMany({
                _id : { $in : eventIds.map((event) => ObjectId(event.eventId)) }
            },{
                $push : {
                members : ObjectId(id)
                }
            }
            );
    
            await UserEvent.updateMany({
                _id : { $in : adminEventIds.map((eventId) => ObjectId(eventId))}
            },{
                $push : {
                admins : ObjectId(id)
                }
            }
            );
        }

        }
        return true;
    }
}