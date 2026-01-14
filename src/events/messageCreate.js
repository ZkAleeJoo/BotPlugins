const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || message.channel.id !== process.env.SUPPORT_CHANNEL_ID) return;

        const userContent = message.content; 
        await message.delete();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_support_modal')
                .setLabel('Completar Formulario de Soporte')
                .setStyle(ButtonStyle.Primary)
        );

        const reply = await message.channel.send({
            content: `Hola ${message.author}, para ayudarte mejor, por favor completa el formulario técnico pulsando el botón.`,
            components: [row]
        });

        setTimeout(() => reply.delete().catch(() => {}), 60000);
    },
};