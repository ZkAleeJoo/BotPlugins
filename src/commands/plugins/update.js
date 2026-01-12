const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const MIS_PLUGINS = [
    { 
        name: 'MaxStaff - GUI And more', 
        value: 'maxstaff_gui_and_more', 
        url: 'https://www.spigotmc.org/resources/maxstaff-gui-and-more.130851/', 
        color: '#ae00fe' 
    },
    { 
        name: 'ClearLag+', 
        value: 'clearlag', 
        url: 'https://www.spigotmc.org/resources/clearlag.122239/', 
        color: '#f8f400' 
    },
    { 
        name: 'SimpleAds', 
        value: 'simpleads', 
        url: 'https://www.spigotmc.org/resources/simpleads.131350/', 
        color: '#000cf8' 
    }

];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Anuncia la actualización de un plugin con versión y cambios.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('plugin')
                .setDescription('El plugin que se actualizó')
                .setRequired(true)
                .addChoices(
                    ...MIS_PLUGINS.map(p => ({ name: p.name, value: p.value }))
                ))
        .addStringOption(option =>
            option.setName('version')
                .setDescription('La nueva versión (ej: v2.5.0)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('descripcion')
                .setDescription('Describe los cambios (puedes usar \n para saltos de línea)')
                .setRequired(true)),

    async execute(interaction) {
        const pluginValue = interaction.options.getString('plugin');
        const version = interaction.options.getString('version');
        const changes = interaction.options.getString('descripcion');

        const pluginData = MIS_PLUGINS.find(p => p.value === pluginValue);
        
        const channelId = process.env.UPDATE_CHANNEL_ID;
        const announcementChannel = interaction.client.channels.cache.get(channelId);

        if (!announcementChannel) {
            return interaction.reply({ 
                content: `❌ **Error:** No encontré el canal con ID \`${channelId}\`.`, 
                ephemeral: true 
            });
        }

        const announcementEmbed = new EmbedBuilder()
            .setTitle(`🚀 ¡Nueva Actualización: ${pluginData.name}!`)
            .setURL(pluginData.url)
            .setColor(pluginData.color)
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .addFields(
                { name: '📦 Versión', value: `\`${version}\``, inline: true },
                { name: '🔗 Enlace', value: `[SpigotMC](${pluginData.url})`, inline: true },
                { name: '📝 Novedades y Cambios', value: changes } 
            )
            .setTimestamp()
            .setFooter({ 
                text: `Anunciado por ${interaction.user.username}`, 
                iconURL: interaction.user.displayAvatarURL() 
            });

        try {
            await announcementChannel.send({ embeds: [announcementEmbed] });
            await interaction.reply({ 
                content: `✅ Anuncio de **${pluginData.name}** enviado correctamente a <#${channelId}>.`, 
                ephemeral: true 
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: '❌ Error al enviar el anuncio. Revisa los permisos del bot.', 
                ephemeral: true 
            });
        }
    },
};