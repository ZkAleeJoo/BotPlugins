const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');

const MIS_PLUGINS = [
    { 
        label: 'Zenith Core', 
        description: 'Sistema principal de utilidades', 
        value: 'zenith_core', 
        url: 'https://www.spigotmc.org/resources/example.1', 
        version: '2.5.0',
        color: '#5865F2' 
    },
    { 
        label: 'Zenith Economy', 
        description: 'Plugin de economía avanzada', 
        value: 'zenith_economy', 
        url: 'https://www.spigotmc.org/resources/example.2', 
        version: '1.2.1',
        color: '#2ECC71' 
    }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Publica el anuncio de actualización de un plugin.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), 

    async execute(interaction) {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_plugin_update')
            .setPlaceholder('Selecciona el plugin actualizado...')
            .addOptions(MIS_PLUGINS.map(p => ({
                label: p.label,
                description: p.description,
                value: p.value
            })));

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            content: '🛡️ **Panel de Actualización:** Selecciona el plugin para enviar el anuncio oficial.',
            components: [row],
            ephemeral: true
        });

        const filter = i => i.customId === 'select_plugin_update' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            const pluginSeleccionado = MIS_PLUGINS.find(p => p.value === i.values[0]);
            
            const channelId = process.env.UPDATE_CHANNEL_ID;
            const announcementChannel = interaction.client.channels.cache.get(channelId);

            if (!announcementChannel) {
                return i.update({ 
                    content: `❌ **Error:** No encontré el canal con ID \`${channelId}\`. Verifica tu archivo \`.env\`.`, 
                    components: [] 
                });
            }

            const announcementEmbed = new EmbedBuilder()
                .setTitle(`🚀 ¡Nueva Actualización: ${pluginSeleccionado.label}!`)
                .setURL(pluginSeleccionado.url)
                .setDescription(`Se ha publicado una nueva versión de **${pluginSeleccionado.label}**. Se recomienda actualizar para obtener las últimas mejoras y correcciones.`)
                .addFields(
                    { name: '📦 Versión Actual', value: `\`v${pluginSeleccionado.version}\``, inline: true },
                    { name: '🔗 Enlace', value: `[Descargar en SpigotMC](${pluginSeleccionado.url})`, inline: true }
                )
                .setColor(pluginSeleccionado.color)
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .setTimestamp()
                .setFooter({ 
                    text: `Publicado por ${interaction.user.username}`, 
                    iconURL: interaction.user.displayAvatarURL() 
                });

            try {
                await announcementChannel.send({ embeds: [announcementEmbed] });
                await i.update({ 
                    content: `✅ **¡Éxito!** El anuncio de **${pluginSeleccionado.label}** ha sido enviado a <#${channelId}>.`, 
                    components: [] 
                });
            } catch (error) {
                console.error(error);
                await i.update({ 
                    content: '❌ Hubo un error al intentar enviar el mensaje al canal. Revisa los permisos del bot.', 
                    components: [] 
                });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ content: '⏰ Tiempo agotado. Usa `/update` de nuevo.', components: [] }).catch(() => {});
            }
        });
    },
};