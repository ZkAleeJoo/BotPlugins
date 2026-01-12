const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true, 
    execute(client) {
        console.log(`Bot Prendido ${client.user.tag}`);

        const activities = [
            { name: 'Spigot/Modrinth', type: ActivityType.Playing },
        ];

        let i = 0;

        const updateStatus = () => {
            if (i >= activities.length) i = 0;
            
            client.user.setActivity({
                name: activities[i].name,
                type: activities[i].type
            });

            i++;
        };

        updateStatus();

        setInterval(updateStatus, 60000); 
    },
};