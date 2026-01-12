const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    PermissionFlagsBits 
} = require('discord.js');

const PLUGINS = [
    { label: 'SuperSkyblock', value: 'superskyblock', url: 'https://spigotmc.org/...', version: '2.0.1' },
    { label: 'UltraEconomy', value: 'ultraeconomy', url: 'https://spigotmc.org/...', version: '1.5.0' },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Anuncia la actualización de un plugin.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), 

    async execute(interaction) {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_plugin_update')
            .setPlaceholder('Selecciona el plugin que se actualizó')
            .addOptions(PLUGINS.map(p => ({ label: p.label, value: p.value })));

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            content: 'Por favor, elige el plugin para el anuncio:',
            components: [row],
            ephemeral: true
        });

        const filter = i => i.customId === 'select_plugin_update' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async i => {
            const selected = PLUGINS.find(p => p.value === i.values[0]);
            
            const announcementChannel = interaction.client.channels.cache.get(process.env.UPDATE_CHANNEL_ID);

            if (!announcementChannel) {
                return i.update({ content: '❌ No se encontró el canal de anuncios. Revisa el .env', components: [] });
            }

            const embed = new EmbedBuilder()
                .setTitle(`🚀 Nueva Actualización: ${selected.label}`)
                .setDescription(`Se ha lanzado una nueva versión de **${selected.label}**. ¡Revisa las novedades!`)
                .addFields(
                    { name: '📦 Versión', value: `\`${selected.version}\``, inline: true },
                    { name: '🔗 Link de Descarga', value: `[Click aquí](${selected.url})`, inline: true }
                )
                .setColor('#00ff00')
                .setTimestamp()
                .setFooter({ text: 'Anuncio de Plugins', iconURL: interaction.client.user.displayAvatarURL() });

            await announcementChannel.send({ embeds: [embed] });
            await i.update({ content: `✅ Anuncio de **${selected.label}** enviado a <#${announcementChannel.id}>`, components: [] });
        });
    },
};