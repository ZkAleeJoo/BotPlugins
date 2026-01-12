const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-roles')
        .setDescription('Envía el panel de autoroles al canal configurado.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const channelId = '1460372642765738268';
        const channel = interaction.client.channels.cache.get(channelId);

        if (!channel) {
            return interaction.reply({ content: '❌ No se pudo encontrar el canal de roles.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('Selección de Roles')
            .setDescription('Haz clic en los botones de abajo para obtener o quitarte los roles de notificaciones.')
            .setColor('#2b2d31')
            .addFields(
                { name: '🟢 Update', value: 'Notificaciones de nuevas versiones.', inline: false },
                { name: '🔴 Sorteos', value: 'Participa en eventos y premios.', inline: false },
                { name: '🟡 Chat Muerto', value: '¡Ayúdanos a revivir el chat!', inline: false },
                { name: '🩵 Ofertas', value: 'Descuentos y promociones especiales.', inline: false },
                { name: '🟣 BlackList', value: 'Información sobre usuarios sancionados.', inline: false }
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('role_1460373287338246392').setLabel('Update').setEmoji('🟢').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('role_1460373363431047250').setLabel('Sorteos').setEmoji('🔴').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('role_1460373389993709740').setLabel('Chat Muerto').setEmoji('🟡').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('role_1460373427113300028').setLabel('Ofertas').setEmoji('🩵').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('role_1460373461452063004').setLabel('BlackList').setEmoji('🟣').setStyle(ButtonStyle.Secondary)
        );

        await channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: '✅ Panel de autoroles enviado.', ephemeral: true });
    },
};