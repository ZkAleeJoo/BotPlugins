const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-roles')
        .setDescription('Despliega el panel profesional de preferencias de notificaciones.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const channelId = '1460372642765738268'; 
        const channel = interaction.client.channels.cache.get(channelId);

        if (!channel) return interaction.reply({ content: 'No se pudo localizar el canal de destino.', ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle('📜 Panel de roles')
            .setDescription(
                "- **Update**\n" +
                "- **Sorteos**\n" +
                "- **Chat Muerto**\n" +
                "- **Ofertas**\n" +
                "- **BlackList**"

            )
            .setColor('#000000') 
            .setFooter({ text: 'Selecciona tus roles en el menú inferior' });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('autorole_menu')
            .setPlaceholder('Seleccionar preferencias...')
            .setMinValues(0) 
            .setMaxValues(5) 
            .addOptions([
                { label: 'Update', value: '1460373287338246392', description: 'Notificaciones de actualizaciones', emoji: '1448307029948108820' },
                { label: 'Sorteos', value: '1460373363431047250', description: 'Participación en eventos', emoji: '1448307028022919302' },
                { label: 'Chat Muerto', value: '1460373389993709740', description: 'Avisos de actividad', emoji: '1448307031873290240' },
                { label: 'Ofertas', value: '1460373427113300028', description: 'Descuentos y promociones', emoji: '1448307047409127484' },
                { label: 'BlackList', value: '1460373461452063004', description: 'Alertas de seguridad', emoji: '1448307037753835723' }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: 'Panel desplegado correctamente.', ephemeral: true });
    },
};