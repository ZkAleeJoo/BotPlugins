const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        // --- MANEJO DE COMANDOS ---
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            try { await command.execute(interaction); } catch (e) { console.error(e); }
        }

        // --- SISTEMA DE AUTOROLES ---
        if (interaction.isStringSelectMenu() && interaction.customId === 'autorole_menu') {
            const selectedRoles = interaction.values; 
            const allAutoroles = [
                '1460373287338246392', '1460373363431047250', 
                '1460373389993709740', '1460373427113300028', 
                '1460373461452063004'
            ];

            try {
                const member = interaction.member;
                const currentRoles = member.roles.cache.map(r => r.id);
                
                const otherRoles = currentRoles.filter(id => !allAutoroles.includes(id));
                
                const finalRoles = [...otherRoles, ...selectedRoles];

                await member.roles.set(finalRoles);

                await interaction.reply({ 
                    content: 'Tus preferencias han sido actualizadas con éxito.', 
                    flags: 64
                });
            } catch (error) {
                console.error('Error en Autoroles:', error);
                await interaction.reply({ 
                    content: 'Error de permisos al actualizar tus roles.', 
                    flags: 64
                });
            }
        }
    },
};