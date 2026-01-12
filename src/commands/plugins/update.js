const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const MIS_PLUGINS = [
    { 
        name: 'MaxStaff - GUI And more', 
        value: 'maxstaff_gui_and_more', 
        url: 'https://www.spigotmc.org/resources/maxstaff-gui-and-more.130851/', 
        thumbnail: 'https://www.spigotmc.org/data/resource_icons/130/130851.jpg?1766411128', 
        color: '#ae00fe' 
    },
    { 
        name: 'ClearLag+', 
        value: 'clearlag', 
        url: 'https://www.spigotmc.org/resources/clearlag.122239/', 
        thumbnail: 'https://www.spigotmc.org/data/resource_icons/122/122239.jpg?1765979700',
        color: '#f8f400' 
    },
    { 
        name: 'SimpleAds', 
        value: 'simpleads', 
        url: 'https://www.spigotmc.org/resources/simpleads.131350/', 
        thumbnail: 'https://www.spigotmc.org/data/resource_icons/131/131350.jpg?1767318794',
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
                .setDescription('Describe los cambios (puedes usar \\n para saltos de línea)')
                .setRequired(true)),

    async execute(interaction) {
        const pluginValue = interaction.options.getString('plugin');
        const version = interaction.options.getString('version');
        
        const rawChanges = interaction.options.getString('descripcion');
        const changes = rawChanges.replace(/\\n/g, '\n');

        const pluginData = MIS_PLUGINS.find(p => p.value === pluginValue);
        
        const channelId = process.env.UPDATE_CHANNEL_ID;
        const announcementChannel = interaction.client.channels.cache.get(channelId);

        if (!announcementChannel) {
            return interaction.reply({ 
                content: `❌ **Error:** No encontré el canal con ID \`${channelId}\`.`, 
                flags: 64
            });
        }

        const announcementEmbed = new EmbedBuilder()
            .setTitle(`Update: ${pluginData.name}!`)
            .setColor(pluginData.color)
            .setThumbnail(pluginData.thumbnail || interaction.client.user.displayAvatarURL())
            .addFields(
                { name: '📦 Versión', value: `\`${version}\``, inline: true },
                { name: '🔗 Enlace', value: `[SpigotMC](${pluginData.url})`, inline: true },
                { name: '📝 Novedades y Cambios', value: changes } 
            )
            .setTimestamp()
            .setFooter({ 
                text: `Anuncio enviado desde Spigot`, 
                iconURL: "https://static.spigotmc.org/img/spigot.png"
            });

        try {
            await announcementChannel.send({ content: '> \`|\` <@&1460373287338246392>', embeds: [announcementEmbed] });
            await interaction.reply({ 
                content: `✅ Anuncio de **${pluginData.name}** enviado correctamente a <#${channelId}>.`, 
                flags: 64
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: '❌ Error al enviar el anuncio. Revisa los permisos del bot.', 
                flags: 64
            });
        }
    },
};