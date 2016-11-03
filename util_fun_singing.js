/* require('util.fun.singing')();
 * NOTES: sentences are broken down using | to seperate pieces
 *        public will default to true
 * 
 * Creep.prototype.sing(sentence, public)
 *   creep will sing a different part of sentence per tick
 * 
 * Room.prototype.sing(sentence, public)
 *   all creeps in the room will sing parts of the sentence
 *     from top left to bottom right. the sentence will repeat
 *     if there are more creeps than parts in the sentence
 */


module.exports = function(){
    Creep.prototype.sing = function(sentence, public){
        if(public === undefined)public = true;
        let words = sentence.split("|");
        this.say(words[Game.time % words.length], public);
    }

    Room.prototype.sing = function(sentence, public){
        if(public === undefined)public = true;
        let words = sentence.split("|");
        let creeps = _.filter(Game.creeps, (c) => c.room.name == this.name);
        creeps = _.sortBy(creeps, function(c){return (c.pos.x + (c.pos.y*50))});
    
        for(let i in creeps){
            creeps[i].say(words[i % words.length], public);
        }
    };
}