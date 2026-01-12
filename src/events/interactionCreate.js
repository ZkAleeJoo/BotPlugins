const { Events, EmbedBuilder } = require('discord.js');
const { createPremiumCode } = require('../utils/dataHandler');
const fs = require('fs');
const path = require('path');

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
            console.error(`Error ejecutando ${interaction.commandName}`);
            console.error(error);

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: '❌ Hubo un error ejecutando este comando.', flags: 64 }).catch(() => {});
            } else {
                await interaction.reply({ content: '❌ Hubo un error ejecutando este comando.', flags: 64 }).catch(() => {});
            }
        }
        }

    },
};