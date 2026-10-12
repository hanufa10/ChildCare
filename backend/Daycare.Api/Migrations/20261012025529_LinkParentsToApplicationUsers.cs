using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Daycare.Api.Migrations
{
    /// <inheritdoc />
    public partial class LinkParentsToApplicationUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApplicationUserId",
                table: "Parents",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Parents_ApplicationUserId",
                table: "Parents",
                column: "ApplicationUserId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Parents_AspNetUsers_ApplicationUserId",
                table: "Parents",
                column: "ApplicationUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Parents_AspNetUsers_ApplicationUserId",
                table: "Parents");

            migrationBuilder.DropIndex(
                name: "IX_Parents_ApplicationUserId",
                table: "Parents");

            migrationBuilder.DropColumn(
                name: "ApplicationUserId",
                table: "Parents");
        }
    }
}
