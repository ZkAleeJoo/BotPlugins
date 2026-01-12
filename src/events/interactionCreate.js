const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        // --- MANEJO DE COMANDOS DE CHAT ---
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: '❌ Error al ejecutar el comando.', flags: 64 }).catch(() => {});
            }
        }

        // --- SISTEMA DE AUTOROLES ---
        if (interaction.isButton()) {
            if (!interaction.customId.startsWith('role_')) return;

            const roleId = interaction.customId.replace('role_', '');
            const role = interaction.guild.roles.cache.get(roleId);

            if (!role) {
                return interaction.reply({ content: '❌ Este rol ya no existe.', ephemeral: true });
            }

            try {
                const member = interaction.member;
                if (member.roles.cache.has(roleId)) {
                    await member.roles.remove(roleId);
                    await interaction.reply({ content: `✅ Se te ha quitado el rol **${role.name}**.`, ephemeral: true });
                } else {
                    await member.roles.add(roleId);
                    await interaction.reply({ content: `✅ Ahora tienes el rol **${role.name}**.`, ephemeral: true });
                }
            } catch (error) {
                console.error('Error al gestionar roles:', error);
                await interaction.reply({ content: '❌ No tengo permisos suficientes para gestionar este rol.', ephemeral: true });
            }
        }
    },
};